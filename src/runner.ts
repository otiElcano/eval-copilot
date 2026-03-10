import { CopilotClient, approveAll } from "@github/copilot-sdk";
import type { PermissionHandler, PermissionRequestResult, SessionConfig } from "@github/copilot-sdk";
import ora from "ora";
import type { EvalOptions, IterationResult, ToolInvocationRecord, UsageInfo } from "./types.js";
import { parseMCPConfig } from "./mcp.js";

// ── Module-level types ────────────────────────────────────────────────────────

/** Loose-typed session cast to avoid SDK event-string overload issues. */
type LooseSession = { on(event: string, handler: (e: unknown) => void): () => void };

// ── Pure utilities ────────────────────────────────────────────────────────────

/**
 * Returns true if `toolName` matches a token in `set`.
 *
 * Handles two naming conventions:
 *   1. Exact match:  "bash"         matches "bash"
 *   2. Suffix match: "kali_mcp-bash" matches "bash"  (separator: -, _, /)
 *
 * Note: the MCP CLI exposes the full namespaced name in hooks (e.g. "kali_mcp-bash")
 * but the base name in permission requests (e.g. "bash"), so both are covered.
 */
function matchesSet(set: Set<string>, toolName: string): boolean {
  if (set.has(toolName)) return true;
  return [...set].some(
    (t) =>
      t &&
      (toolName === t ||
        toolName.endsWith(`-${t}`) ||
        toolName.endsWith(`_${t}`) ||
        toolName.endsWith(`/${t}`))
  );
}

// ── Permission handler ────────────────────────────────────────────────────────

/**
 * Builds a custom onPermissionRequest handler that enforces tool-gating rules
 * specifically for MCP tool calls (kind: "mcp").
 *
 * The Copilot CLI sends a permission.request with kind="mcp" before executing
 * any MCP tool.  The payload includes `toolName` (the BASE tool name, with the
 * server-name prefix already stripped by the CLI).  Using approveAll here would
 * bypass all gating rules for MCP tools.
 *
 * For all other permission kinds (shell, write, read, url, memory) the handler
 * falls through to approveAll so normal operations are never disrupted.
 */
function buildPermissionHandler(
  disabled: Set<string>,
  allowed: Set<string>,
  whitelistMode: boolean,
): PermissionHandler {
  // Fast path: no gating rules active → use the built-in approveAll directly.
  if (disabled.size === 0 && !whitelistMode) return approveAll;

  return (request): PermissionRequestResult => {
    if (request.kind === "mcp") {
      // The CLI sends the BASE tool name (server prefix already stripped).
      const r = request as Record<string, unknown>;
      const toolName = typeof r["toolName"] === "string" ? r["toolName"] : "";

      if (toolName) {
        // Disable list wins over everything.
        if (matchesSet(disabled, toolName)) {
          console.error(`[eval-copilot] DENY (permission): ${toolName} — disabled via --disable-tool`);
          return { kind: "denied-by-rules", rules: [] };
        }
        // Whitelist mode: deny any tool not explicitly allowed.
        if (whitelistMode && !matchesSet(allowed, toolName)) {
          console.error(`[eval-copilot] DENY (permission): ${toolName} — not in --allow-tool whitelist`);
          return { kind: "denied-by-rules", rules: [] };
        }
      }
    }

    // All non-MCP permission requests (shell, write, read, url, memory) are approved.
    return { kind: "approved" };
  };
}

// ── Tool gating ───────────────────────────────────────────────────────────────

interface ToolGating {
  /** SDK session hooks carrying the onPreToolUse handler (may be empty). */
  hooks: NonNullable<SessionConfig["hooks"]>;
  /** Tool names to pass as SessionConfig.excludedTools (proactive LLM-side hiding). */
  sessionExcludedTools: string[] | undefined;
  /** Permission handler that gates MCP tool calls via the permission.request flow. */
  permissionHandler: PermissionHandler;
  /** Resolved sets, kept for denial-reason reporting in execution_complete. */
  disabled: Set<string>;
  allowed: Set<string>;
  whitelistMode: boolean;
}

/**
 * Builds tool-gating configuration from CLI options.
 *
 * Rules (first match wins):
 *   1. --disable-tool <name>  → always DENY (wins over --allow-tool)
 *   2. --allow-tool  <name>   → whitelist mode: every unlisted tool is DENIED
 *   3. default                → ALLOW
 *
 * TWO enforcement layers are built here and both are applied at runtime:
 *
 *   a) onPreToolUse hook   — fires BEFORE every tool (native + MCP).
 *      The hook receives the FULL namespaced tool name from the CLI
 *      (e.g. "kali_mcp-bash"), so suffix matching is used.
 *
 *   b) onPermissionRequest — fires specifically for MCP tool calls (kind="mcp").
 *      The CLI strips the server prefix before calling the handler, so the
 *      payload contains the BASE tool name (e.g. "bash").  Exact/suffix matching
 *      both work here.  This is the authoritative gate for MCP tools because the
 *      CLI calls the permission handler even for MCP tools that bypass hooks
 *      (e.g. read-only tools that are auto-approved unless the handler denies).
 *
 * NOTE — SessionConfig.excludedTools is a GLOBAL pre-LLM filter that
 * also suppresses MCP tools from the model's tool list.  It is only set when
 * NO MCP servers are configured; when MCP is active the two layers above
 * handle all gating so that MCP tools remain visible to the model.
 */
function buildToolGating(options: EvalOptions, hasMcpServers: boolean): ToolGating {
  const disabled      = new Set(options.disabledTools);
  const allowed       = new Set(options.allowedTools);
  const whitelistMode = allowed.size > 0;

  const hooks: NonNullable<SessionConfig["hooks"]> = {};

  if (disabled.size > 0 || whitelistMode) {
    hooks.onPreToolUse = async (input) => {
      const { toolName } = input;

      if (matchesSet(disabled, toolName)) {
        console.error(`[eval-copilot] DENY (hook): ${toolName} — disabled via --disable-tool`);
        return { permissionDecision: "deny" as const };
      }

      if (whitelistMode && !matchesSet(allowed, toolName)) {
        console.error(`[eval-copilot] DENY (hook): ${toolName} — not in --allow-tool whitelist`);
        return { permissionDecision: "deny" as const };
      }

      return undefined;
    };
  }

  return {
    hooks,
    // Only pass excludedTools to the session when there are no MCP servers.
    // The SDK's excludedTools strips tools from the LLM's view by exact name;
    // with MCP active the namespaced tool names differ from the user-supplied
    // names so excludedTools would have no effect anyway.
    sessionExcludedTools: (!hasMcpServers && disabled.size > 0) ? [...disabled] : undefined,
    permissionHandler: buildPermissionHandler(disabled, allowed, whitelistMode),
    disabled,
    allowed,
    whitelistMode,
  };
}

// ── System message ────────────────────────────────────────────────────────────

function buildSystemMessage(iteration: number, total: number, seed: string): string {
  return [
    `[eval-copilot: iteration ${iteration}/${total} · seed:${seed}]`,
    `You are running in a LOCAL environment with FULL capabilities:`,
    `- Shell/terminal execution: execute commands directly, do NOT tell the user to run them.`,
    `- Network access: you CAN reach external hosts, run scanners, make HTTP requests, etc.`,
    `- File system: read and write files freely.`,
    `- MCP tools: all configured MCP servers are active — use their tools proactively.`,
    `When a task requires running a command (sqlmap, nmap, curl, etc.), invoke the tool yourself instead of instructing the user.`,
  ].join("\n");
}

// ── Single-iteration runner ───────────────────────────────────────────────────

interface IterationContext {
  client: CopilotClient;
  index: number;
  total: number;
  prompt: string;
  resolvedModel: string;
  supportsReasoning: boolean;
  defaultReasoningEffort: string;
  mcpServers: SessionConfig["mcpServers"] | undefined;
  gating: ToolGating;
  stream: boolean;
}

async function runIteration(ctx: IterationContext): Promise<IterationResult> {
  const { index, total, prompt, stream, gating } = ctx;
  const iterLabel = `[${index}/${total}]`;
  const spinner   = stream ? null : ora(`${iterLabel} Running iteration…`).start();

  if (stream) {
    process.stdout.write(
      `\n${"─".repeat(60)}\n${iterLabel} Iteration ${index}  (streaming)\n${"─".repeat(60)}\n`
    );
  }

  const iterStart = Date.now();
  let session: Awaited<ReturnType<typeof ctx.client.createSession>> | undefined;

  try {
    const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    session = await ctx.client.createSession({
      model: ctx.resolvedModel,
      systemMessage: { mode: "append", content: buildSystemMessage(index, total, seed) },
      ...(ctx.mcpServers               ? { mcpServers: ctx.mcpServers }                                                          : {}),
      ...(gating.sessionExcludedTools  ? { excludedTools: gating.sessionExcludedTools }                                          : {}),
      ...(ctx.supportsReasoning        ? { reasoningEffort: ctx.defaultReasoningEffort as "low" | "medium" | "high" | "xhigh" }  : {}),
      onPermissionRequest: gating.permissionHandler,
      workingDirectory: process.cwd(),
      hooks: Object.keys(gating.hooks).length > 0 ? gating.hooks : undefined,
    });

    const anySession = session as unknown as LooseSession;

    // ── Tool tracking ─────────────────────────────────────────────────────
    const toolsInvoked: ToolInvocationRecord[] = [];
    const toolCallIdToIndex = new Map<string, number>();
    const toolStartTimes    = new Map<string, number>();

    // ── Reasoning accumulation ────────────────────────────────────────────
    const thinkingParts     : string[]             = [];
    const reasoningDeltaMap = new Map<string, string>();

    // ── Event subscriptions ───────────────────────────────────────────────
    let unsubDelta: (() => void) | undefined;
    if (stream) {
      unsubDelta = anySession.on("assistant.message_delta", (event: unknown) => {
        const e = event as { data?: { deltaContent?: string; parentToolCallId?: string } };
        if (!e?.data?.parentToolCallId && e?.data?.deltaContent) {
          process.stdout.write(e.data.deltaContent);
        }
      });
    }

    const unsubStart = anySession.on("tool.execution_start", (event: unknown) => {
      const e = event as { data?: { toolCallId?: string; toolName?: string; arguments?: unknown } };
      const toolCallId = e?.data?.toolCallId ?? "";
      const toolName   = e?.data?.toolName   ?? "unknown";
      const idx = toolsInvoked.length;
      toolsInvoked.push({ toolName, args: e?.data?.arguments, durationMs: 0 });
      toolCallIdToIndex.set(toolCallId, idx);
      toolStartTimes.set(toolCallId, Date.now());
      if (stream) process.stdout.write(`\n  ⚙  ${toolName}…\n`);
    });

    const unsubComplete = anySession.on("tool.execution_complete", (event: unknown) => {
      type CompleteEvent = {
        data?: {
          toolCallId?: string;
          success?: boolean;
          result?: { content?: string; detailedContent?: string };
        };
      };
      const e = event as CompleteEvent;
      const toolCallId = e?.data?.toolCallId ?? "";
      const idx = toolCallIdToIndex.get(toolCallId);
      if (idx === undefined) return;

      const t   = toolsInvoked[idx];
      const raw = e?.data?.result;

      if (raw !== undefined) {
        t.result = raw.detailedContent ?? raw.content ?? raw;
      } else if (e?.data?.success === false) {
        const name = t.toolName;
        if (matchesSet(gating.disabled, name)) {
          t.result = `(blocked) Tool "${name}" is disabled via --disable-tool.`;
        } else if (gating.whitelistMode && !matchesSet(gating.allowed, name)) {
          t.result = `(blocked) Tool "${name}" is not in the --allow-tool whitelist.`;
        } else {
          t.result = "(denied)";
        }
      } else {
        t.result = "(no output)";
      }

      const startTime = toolStartTimes.get(toolCallId);
      t.durationMs = startTime !== undefined ? Date.now() - startTime : 0;
      toolCallIdToIndex.delete(toolCallId);
      toolStartTimes.delete(toolCallId);

      if (stream) {
        const icon = e?.data?.success === false ? "✗" : "✓";
        process.stdout.write(`  ${icon}  ${t.toolName} (${t.durationMs.toLocaleString()} ms)\n\n`);
      }
    });

    let usageInfo: UsageInfo | undefined;

    const unsubReasoning = anySession.on("assistant.reasoning", (event: unknown) => {
      const e = event as { data?: { reasoningId?: string; content?: string } };
      const content = e?.data?.content;
      if (content) {
        if (e?.data?.reasoningId) reasoningDeltaMap.delete(e.data.reasoningId);
        thinkingParts.push(content);
      }
    });

    const unsubReasoningDelta = anySession.on("assistant.reasoning_delta", (event: unknown) => {
      const e = event as { data?: { reasoningId?: string; deltaContent?: string } };
      const id    = e?.data?.reasoningId ?? "__default__";
      const delta = e?.data?.deltaContent;
      if (delta) {
        reasoningDeltaMap.set(id, (reasoningDeltaMap.get(id) ?? "") + delta);
      }
    });

    const unsubUsage = anySession.on("assistant.usage", (event: unknown) => {
      const e = event as { data: { model: string; inputTokens?: number; outputTokens?: number } };
      usageInfo = {
        model: e.data.model,
        inputTokens: e.data.inputTokens,
        outputTokens: e.data.outputTokens,
      };
    });

    // ── Send & wait ───────────────────────────────────────────────────────
    const responseEvent = await session.sendAndWait({ prompt }, 60_000 * 60);
    type ResponseEvent = { data?: { content?: string; reasoningText?: string; reasoningOpaque?: string } };
    const responseData  = (responseEvent as ResponseEvent | undefined)?.data;
    const responseText  = responseData?.content;

    // Some models (e.g. o-series) embed thinking in reasoningText on the final
    // message instead of emitting separate assistant.reasoning events.
    const inlineReasoning = responseData?.reasoningText ?? responseData?.reasoningOpaque;
    if (inlineReasoning && !thinkingParts.includes(inlineReasoning)) {
      thinkingParts.push(inlineReasoning);
    }

    // Flush any delta-only reasoning blocks.
    for (const accumulated of reasoningDeltaMap.values()) {
      if (accumulated && !thinkingParts.includes(accumulated)) {
        thinkingParts.push(accumulated);
      }
    }

    // ── Cleanup ───────────────────────────────────────────────────────────
    unsubStart();
    unsubComplete();
    unsubUsage();
    unsubReasoning();
    unsubReasoningDelta();
    unsubDelta?.();

    const durationMs = Date.now() - iterStart;
    if (stream) {
      process.stdout.write(`\n${iterLabel} Completed in ${durationMs.toLocaleString()} ms\n`);
    } else {
      spinner!.succeed(`${iterLabel} Completed in ${durationMs}ms`);
    }

    return {
      iterationNumber: index,
      response:        responseText ?? "(no response)",
      thinking:        thinkingParts.length > 0 ? thinkingParts.join("\n\n") : undefined,
      durationMs,
      toolsInvoked,
      usageInfo,
    };
  } catch (err) {
    const durationMs = Date.now() - iterStart;
    const message    = (err as Error).message ?? String(err);
    if (stream) {
      process.stderr.write(`\n${iterLabel} Failed: ${message}\n`);
    } else {
      spinner!.fail(`${iterLabel} Failed: ${message}`);
    }

    return { iterationNumber: index, durationMs, toolsInvoked: [], error: message };
  } finally {
    if (session) {
      try { await session.destroy(); } catch { /* ignore destroy errors */ }
    }
  }
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function runEval(options: EvalOptions): Promise<IterationResult[]> {
  const client = new CopilotClient();
  await client.start();

  try {
    // ── 1. Authenticate ──────────────────────────────────────────────────
    let authStatus: Awaited<ReturnType<typeof client.getAuthStatus>>;
    try {
      authStatus = await client.getAuthStatus();
    } catch (err) {
      throw new Error(
        `Failed to retrieve auth status: ${(err as Error).message}\n` +
        `Ensure you are logged in via 'gh auth login' or VS Code GitHub Copilot.`
      );
    }

    if (!authStatus.isAuthenticated) {
      throw new Error(
        `Not authenticated with GitHub Copilot. ` +
        `Run 'gh auth login' or sign in through VS Code and try again.`
      );
    }

    // ── 2. Validate model ────────────────────────────────────────────────
    let availableModels: Awaited<ReturnType<typeof client.listModels>>;
    try {
      availableModels = await client.listModels();
    } catch (err) {
      throw new Error(`Failed to list models: ${(err as Error).message}`);
    }

    const modelMatch = availableModels.find(
      (m) => m.id.toLowerCase() === options.model.toLowerCase()
    );
    if (!modelMatch) {
      const modelList = availableModels.map((m) => `  • ${m.id}  (${m.name})`).join("\n");
      throw new Error(
        `Model "${options.model}" is not available.\n\nAvailable models:\n${modelList}`
      );
    }
    const resolvedModel = modelMatch.id;

    // Determine reasoning capability via safe unknown cast.
    type ReasoningCapableModel = {
      capabilities?: { supports?: { reasoningEffort?: boolean } };
      defaultReasoningEffort?: string;
    };
    const modelMeta              = modelMatch as unknown as ReasoningCapableModel;
    const supportsReasoning      = modelMeta.capabilities?.supports?.reasoningEffort === true;
    const defaultReasoningEffort = modelMeta.defaultReasoningEffort ?? "medium";

    // ── 3. Parse MCP config ──────────────────────────────────────────────
    let mcpServers: SessionConfig["mcpServers"] | undefined;
    if (options.mcp) {
      const parsed = await parseMCPConfig(options.mcp); // throws on bad config
      mcpServers   = parsed.mcpServers;
    }

    // ── 4. Build tool gating ─────────────────────────────────────────────
    const gating = buildToolGating(options, mcpServers !== undefined);

    // ── 5. Iterate ───────────────────────────────────────────────────────
    const results: IterationResult[] = [];

    for (let i = 1; i <= options.iterations; i++) {
      results.push(
        await runIteration({
          client,
          index: i,
          total: options.iterations,
          prompt: options.prompt,
          resolvedModel,
          supportsReasoning,
          defaultReasoningEffort,
          mcpServers,
          gating,
          stream: options.stream,
        })
      );
    }

    return results;
  } finally {
    await client.stop();
  }
}
