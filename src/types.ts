import type { MCPLocalServerConfig, MCPRemoteServerConfig } from "@github/copilot-sdk";

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

export interface MCPServerEntry {
  [name: string]: MCPLocalServerConfig | MCPRemoteServerConfig;
}

export interface MCPConfig {
  servers: MCPServerEntry;
}

export interface EvalOptions {
  prompt: string;
  iterations: number;
  model: string;
  mcp?: string;
  disableNativeTools: boolean;
  /** Individual native tool names to block (additive with disableNativeTools). */
  disabledTools: string[];
  /** Explicit tool whitelist — these tools are always allowed regardless of any disable flag.
   *  Mirrors `copilot --allow-tool <name>` (repeatable). */
  allowedTools: string[];
  /** Stream each iteration's output to the terminal in real-time. */
  stream: boolean;
}
