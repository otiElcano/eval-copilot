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

  // ── 5. Build tool-gating via onPreToolUse hook ───────────────────────────
  //
  // IMPORTANT: SessionConfig.availableTools / excludedTools are GLOBAL filters
  // that also suppress external MCP tools from the LLM's tool list.  Using
  // them to block native tools would silently strip all MCP-provided tools too,
  // because the SDK applies the filter before presenting tools to the model.
  //
  // Instead we gate tools exclusively via onPreToolUse:
  //   • The hook fires AFTER the LLM has decided to call a tool, but BEFORE
  //     the tool executes. Returning { permissionDecision: "deny" } stops
  //     execution and reports the denial to the model, which then adapts.
  //   • "(pending)" in the report only appears when execution_complete fires
  //     without a result; our event handler now maps that to "(denied)" so
  //     the report always shows a meaningful status.
  //   • SDK-native excludedTools IS still used for plain --disable-tool (no
  //     global disable) because in that case we never touch MCP tool names.
  //
  // Decision table for onPreToolUse:
  //   1. --allow-tool X         → always allow, regardless of disable flags
  //   2. --disable-tool X       → always deny  (allow wins if both are set)
  //   3. --disable-builtin-mcps / --disable-native-tools:
  //        • non-wildcard MCP   → allow if tool is in the MCP config's explicit
  //                               tool list; deny all others
  //        • wildcard MCP       → cannot distinguish MCP from native at this
  //                               point → allow all (best-effort)

  const explicitlyDisabled = new Set(options.disabledTools);
  const allowedToolNames   = new Set(options.allowedTools);
  const disableAllNative   = options.disableNativeTools || options.disableBuiltinMcps;

  const hooks: SessionConfig["hooks"] = {};

  // Only install the hook when there's actually something to gate.
  const needsHook = disableAllNative || explicitlyDisabled.size > 0;

  if (needsHook) {
    hooks.onPreToolUse = async (input) => {
      const { toolName } = input;

      // Rule 1 — explicit allow-list always wins.
      if (allowedToolNames.has(toolName)) return undefined;

      // Rule 2 — explicit block-list.
      if (explicitlyDisabled.has(toolName)) {
        return { permissionDecision: "deny" as const };
      }

      // Rule 3 — global native-tool disable.
      if (disableAllNative) {
        if (mcpHasWildcard) {
          // Wildcard MCP: we cannot enumerate MCP tool names upfront.
          // Allow everything so external MCP tools remain usable.
          return undefined;
        }
        // Non-wildcard: allow only tools declared in the MCP config.
        if (mcpToolNames.has(toolName)) return undefined;
        // Deny everything else (native Copilot built-in tools).
        return { permissionDecision: "deny" as const };
      }

      return undefined;
    };
  }

  // For plain --disable-tool (no global disable) we additionally pass
  // excludedTools so the LLM never sees those tools at all, which avoids
  // spurious tool calls that would just be denied by the hook.
  const sessionExcludedTools: string[] | undefined =
    (!disableAllNative && explicitlyDisabled.size > 0)
      ? [...explicitlyDisabled].filter((t) => !allowedToolNames.has(t))
      : undefined;

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
        ...(sessionExcludedTools !== undefined ? { excludedTools: sessionExcludedTools } : {}),
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
