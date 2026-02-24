import { CopilotClient } from "@github/copilot-sdk";
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

  // ── 5. Build hooks (disable-native-tools) ─────────────────────────────────
  const hooks: SessionConfig["hooks"] = {};
  if (options.disableNativeTools) {
    hooks.onPreToolUse = async (input) => {
      const { toolName } = input;
      // Allow if wildcard MCP (all tools are MCP tools)
      if (mcpHasWildcard) return undefined;
      // Allow if the tool is explicitly listed as an MCP tool
      if (mcpToolNames.has(toolName)) return undefined;
      // Deny all others (native Copilot tools)
      return { permissionDecision: "deny" as const };
    };
  }

  // ── 6. Iterate ────────────────────────────────────────────────────────────
  const results: IterationResult[] = [];

  for (let i = 1; i <= options.iterations; i++) {
    const spinner = ora(`[${i}/${options.iterations}] Running iteration…`).start();
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
          content: `[eval-copilot: iteration ${i}/${options.iterations} · seed:${iterSeed}]`,
        },
        ...(mcpServers ? { mcpServers } : {}),
        hooks: Object.keys(hooks).length > 0 ? hooks : undefined,
      });

      // Track tool invocations
      const toolsInvoked: ToolInvocationRecord[] = [];
      const toolStartTimes = new Map<string, number>();

      // Use a loose-typed helper to avoid overload resolution issues with SDK event strings
      type LooseSession = { on(eventType: string, handler: (event: unknown) => void): () => void };
      const anySession = session as unknown as LooseSession;

      const unsubStart = anySession.on("tool.execution_start", (event: unknown) => {
        const e = event as { data: { toolName: string; arguments: unknown } };
        toolStartTimes.set(e.data.toolName, Date.now());
        toolsInvoked.push({ toolName: e.data.toolName, args: e.data.arguments, durationMs: 0 });
      });

      const unsubComplete = anySession.on("tool.execution_complete", (event: unknown) => {
        const e = event as { data: { toolName: string; success: boolean; result: unknown } };
        const startTime = toolStartTimes.get(e.data.toolName);
        // Find the matching pending record (no result yet)
        const pending = [...toolsInvoked].reverse().find(
          (t) => t.toolName === e.data.toolName && t.result === undefined
        );
        if (pending) {
          pending.result = e.data.result;
          pending.durationMs = startTime !== undefined ? Date.now() - startTime : 0;
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

      // Send prompt and wait for the final response
      const responseEvent = await session.sendAndWait({ prompt: options.prompt });
      const responseText = (responseEvent as { data?: { content?: string } } | undefined)?.data?.content;

      // Clean up subscriptions
      unsubStart();
      unsubComplete();
      unsubUsage();

      const durationMs = Date.now() - iterStart;
      spinner.succeed(`[${i}/${options.iterations}] Completed in ${durationMs}ms`);

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
      spinner.fail(`[${i}/${options.iterations}] Failed: ${message}`);

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
