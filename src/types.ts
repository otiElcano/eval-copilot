export interface ToolInvocationRecord {
  toolName: string;
  args: unknown;
  result?: unknown;
  durationMs: number;
}

export interface UsageInfo {
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface IterationResult {
  iterationNumber: number;
  response?: string;
  thinking?: string;
  durationMs: number;
  toolsInvoked: ToolInvocationRecord[];
  error?: string;
  usageInfo?: UsageInfo;
}

export interface EvalOptions {
  prompt: string;
  iterations: number;
  model: string;
  mcp?: string;
  /** Tool names to block. Applies to both native Copilot tools and MCP tools.
   *  All tools are enabled by default; only tools listed here are disabled. */
  disabledTools: string[];
  /** Whitelist of tool names. When non-empty, ONLY these tools are allowed;
   *  every other tool is denied. --disable-tool still wins over --allow-tool. */
  allowedTools: string[];
  /** Stream each iteration's output to the terminal in real-time. */
  stream: boolean;
}
