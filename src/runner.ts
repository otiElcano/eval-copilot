import { CopilotClient, approveAll } from "@github/copilot-sdk";
import type { SessionConfig } from "@github/copilot-sdk";
import ora from "ora";
import type { EvalOptions, IterationResult, ToolInvocationRecord, UsageInfo } from "./types.js";
import { parseMCPConfig } from "./mcp.js";

export async function runEval(options: EvalOptions): Promise<IterationResult[]> {
  // ── 1. Initialize client ──────────────────────────────────────────────────
  const client = new CopilotClient();
  await client.start();

  // ── 2. Authenticate ───────────────────────────────────────────────────────
  let authStatus: Awaited<ReturnType<typeof client.getAuthStatus>>;
  try {
    authStatus = await client.getAuthStatus();
  } catch (err) {
    await client.stop();
    throw new Error(
      `Failed to retrieve auth status: ${(err as Error).message}\n` +
      `Ensure you are logged in via 'gh auth login' or VS Code GitHub Copilot.`
    );
  }

  if (!authStatus.isAuthenticated) {
    await client.stop();
    throw new Error(
      `Not authenticated with GitHub Copilot. ` +
      `Run 'gh auth login' or sign in through VS Code and try again.`
    );
  }

  // ── 3. Validate model ─────────────────────────────────────────────────────
  let availableModels: Awaited<ReturnType<typeof client.listModels>>;
  try {
    availableModels = await client.listModels();
  } catch (err) {
    await client.stop();
    throw new Error(`Failed to list models: ${(err as Error).message}`);
  }

  const modelMatch = availableModels.find(
    (m) => m.id.toLowerCase() === options.model.toLowerCase()
  );
  if (!modelMatch) {
    await client.stop();
    const modelList = availableModels.map((m) => `  • ${m.id}  (${m.name})`).join("\n");
    throw new Error(
      `Model "${options.model}" is not available.\n\nAvailable models:\n${modelList}`
    );
  }
  const resolvedModel = modelMatch.id;

  // ── 4. Parse MCP config ───────────────────────────────────────────────────
  let mcpServers: SessionConfig["mcpServers"] | undefined;
  let mcpToolNames = new Set<string>();
  let mcpHasWildcard = false;

  if (options.mcp) {
    try {
      const parsed = await parseMCPConfig(options.mcp);
      mcpServers = parsed.mcpServers;
      mcpToolNames = parsed.toolNames;
      mcpHasWildcard = parsed.hasWildcard;
    } catch (err) {
      await client.stop();
      throw err;
    }
  }

  // ── 5. Compute native tool-availability config for SessionConfig ──────────
  //
  // The SDK exposes two first-class fields on SessionConfig:
  //   availableTools  – whitelist: only these tools exist for the session.
  //   excludedTools   – blacklist: all tools except these are available.
  //                     (ignored when availableTools is set)
  //
  // We prefer these over onPreToolUse hooks because:
  //   - Hooks run AFTER the tool call is already scheduled, so denied tools
  //     still show up with a real duration but undefined result → "(pending)"
  //     in the report.
  //   - availableTools/excludedTools prevent the tool from being offered to
  //     the LLM in the first place — cleaner and more reliable.

  const explicitlyDisabled = new Set(options.disabledTools);
  const allowedToolNames   = new Set(options.allowedTools);
  const disableAllNative   = options.disableNativeTools || options.disableBuiltinMcps;

  // sessionAvailableTools: defined → whitelist mode (availableTools in SDK)
  // sessionExcludedTools:  defined → blacklist mode (excludedTools in SDK)
  let sessionAvailableTools: string[] | undefined;
  let sessionExcludedTools:  string[] | undefined;

  if (disableAllNative) {
    if (mcpHasWildcard) {
      // Wildcard MCP: we cannot enumerate all MCP tool names upfront, so we
      // cannot build a whitelist. Fall through to hook-based filtering below.
    } else {
      // Build whitelist from: explicitly --allow-tool names + known MCP tools
      const whitelist = new Set<string>([
        ...allowedToolNames,
        ...mcpToolNames,
      ]);
      sessionAvailableTools = [...whitelist];
    }
  } else if (explicitlyDisabled.size > 0) {
    // No global disable — just block specific tools.
    // If an allow-listed tool is also in the block-list, allow wins.
    const blocked = [...explicitlyDisabled].filter((t) => !allowedToolNames.has(t));
    if (blocked.length > 0) sessionExcludedTools = blocked;
  }

  // Fallback hook: only needed when wildcardMCP + disableAllNative (cannot
  // build a static whitelist because MCP tool names aren't known ahead of time).
  const hooks: SessionConfig["hooks"] = {};

  if (disableAllNative && mcpHasWildcard) {
    hooks.onPreToolUse = async (input) => {
      const { toolName } = input;
      // Explicitly allowed tools always win
      if (allowedToolNames.has(toolName)) return undefined;
      // MCP tools from a wildcard server: we cannot enumerate them statically,
      // so we fall back to allow-all here (same as no hook).
      // If you know specific tool names to block, use --disable-tool instead.
      return undefined;
    };
  }

  // ── 6. Iterate ────────────────────────────────────────────────────────────
  const results: IterationResult[] = [];

  for (let i = 1; i <= options.iterations; i++) {
    const iterLabel = `[${i}/${options.iterations}]`;
    const spinner = options.stream ? null : ora(`${iterLabel} Running iteration…`).start();
    if (options.stream) {
      process.stdout.write(`\n${'─'.repeat(60)}\n${iterLabel} Iteration ${i}  (streaming)\n${'─'.repeat(60)}\n`);
    }
    const iterStart = Date.now();

    let session: Awaited<ReturnType<typeof client.createSession>> | undefined;

    try {
      // Create a fresh isolated session for every iteration.
      // A unique seed is appended to the system message to bust server-side
      // prompt caching — without it, identical context + prompt yields a
      // cached (deterministic) response every time.
      const iterSeed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      session = await client.createSession({
        model: resolvedModel,
        systemMessage: {
          // Append mode: SDK foundation + our instructions
          mode: "append",
          content: [
            `[eval-copilot: iteration ${i}/${options.iterations} · seed:${iterSeed}]`,
            `You are running in a LOCAL environment with FULL capabilities:`,
            `- Shell/terminal execution: execute commands directly, do NOT tell the user to run them.`,
            `- Network access: you CAN reach external hosts, run scanners, make HTTP requests, etc.`,
            `- File system: read and write files freely.`,
            `- MCP tools: all configured MCP servers are active — use their tools proactively.`,
            `When a task requires running a command (sqlmap, nmap, curl, etc.), invoke the tool yourself instead of instructing the user.`,
          ].join("\n"),
        },
        ...(mcpServers ? { mcpServers } : {}),
        ...(sessionAvailableTools !== undefined ? { availableTools: sessionAvailableTools } : {}),
        ...(sessionExcludedTools  !== undefined ? { excludedTools:  sessionExcludedTools  } : {}),
        onPermissionRequest: approveAll,
        workingDirectory: process.cwd(),
        hooks: Object.keys(hooks).length > 0 ? hooks : undefined,
      });

      // Track tool invocations
      const toolsInvoked: ToolInvocationRecord[] = [];
      // Map toolCallId -> index in toolsInvoked for reliable start↔complete pairing
      const toolCallIdToIndex = new Map<string, number>();
      const toolStartTimes = new Map<string, number>(); // keyed by toolCallId

      // Use a loose-typed helper to avoid overload resolution issues with SDK event strings
      type LooseSession = { on(eventType: string, handler: (event: unknown) => void): () => void };
      const anySession = session as unknown as LooseSession;

      // ── Stream assistant tokens to stdout ────────────────────────────────
      let unsubDelta: (() => void) | undefined;
      if (options.stream) {
        unsubDelta = anySession.on("assistant.message_delta", (event: unknown) => {
          const e = event as { data?: { deltaContent?: string; parentToolCallId?: string } };
          // Only stream top-level response (not tool sub-calls)
          if (!e?.data?.parentToolCallId && e?.data?.deltaContent) {
            process.stdout.write(e.data.deltaContent);
          }
        });
      }

      const unsubStart = anySession.on("tool.execution_start", (event: unknown) => {
        const e = event as { data?: { toolCallId?: string; toolName?: string; arguments?: unknown } };
        const toolCallId = e?.data?.toolCallId ?? "";
        const toolName = e?.data?.toolName ?? "unknown";
        const args = e?.data?.arguments;
        const idx = toolsInvoked.length;
        toolsInvoked.push({ toolName, args, durationMs: 0 });
        toolCallIdToIndex.set(toolCallId, idx);
        toolStartTimes.set(toolCallId, Date.now());
        if (options.stream) {
          process.stdout.write(`\n  ⚙  ${toolName}…\n`);
        }
      });

      const unsubComplete = anySession.on("tool.execution_complete", (event: unknown) => {
        const e = event as { data?: { toolCallId?: string; success?: boolean; result?: { content?: string; detailedContent?: string } } };
        const toolCallId = e?.data?.toolCallId ?? "";
        const idx = toolCallIdToIndex.get(toolCallId);
        if (idx !== undefined) {
          const t = toolsInvoked[idx];
          const raw = e?.data?.result;
          if (raw !== undefined) {
            // Prefer detailedContent (raw output) over condensed content
            t.result = raw.detailedContent ?? raw.content ?? raw;
          } else {
            // Tool was denied by hook or produced no output
            t.result = e?.data?.success === false ? "(denied)" : "(no output)";
          }
          const startTime = toolStartTimes.get(toolCallId);
          t.durationMs = startTime !== undefined ? Date.now() - startTime : 0;
          toolCallIdToIndex.delete(toolCallId);
          toolStartTimes.delete(toolCallId);
          if (options.stream) {
            const icon = e?.data?.success === false ? "✗" : "✓";
            process.stdout.write(`  ${icon}  ${t.toolName} (${t.durationMs.toLocaleString()} ms)\n\n`);
          }
        }
      });

      // Capture usage info via event
      let usageInfo: UsageInfo | undefined;
      const unsubUsage = anySession.on("assistant.usage", (event: unknown) => {
        const e = event as { data: { model: string; inputTokens?: number; outputTokens?: number } };
        usageInfo = {
          model: e.data.model,
          inputTokens: e.data.inputTokens,
          outputTokens: e.data.outputTokens,
        };
      });

      // Send prompt and wait for the final response (no timeout cap)
      const responseEvent = await session.sendAndWait({ prompt: options.prompt }, 60000 * 60);
      const responseText = (responseEvent as { data?: { content?: string } } | undefined)?.data?.content;

      // Clean up subscriptions
      unsubStart();
      unsubComplete();
      unsubUsage();
      unsubDelta?.();

      const durationMs = Date.now() - iterStart;
      if (options.stream) {
        process.stdout.write(`\n${iterLabel} Completed in ${durationMs.toLocaleString()} ms\n`);
      } else {
        spinner!.succeed(`${iterLabel} Completed in ${durationMs}ms`);
      }

      results.push({
        iterationNumber: i,
        response: responseText ?? "(no response)",
        durationMs,
        toolsInvoked,
        usageInfo,
      });
    } catch (err) {
      const durationMs = Date.now() - iterStart;
      const message = (err as Error).message ?? String(err);
      if (options.stream) {
        process.stderr.write(`\n${iterLabel} Failed: ${message}\n`);
      } else {
        spinner!.fail(`${iterLabel} Failed: ${message}`);
      }

      results.push({
        iterationNumber: i,
        durationMs,
        toolsInvoked: [],
        error: message,
      });
    } finally {
      if (session) {
        try {
          await session.destroy();
        } catch {
          // ignore destroy errors
        }
      }
    }
  }

  await client.stop();
  return results;
}
