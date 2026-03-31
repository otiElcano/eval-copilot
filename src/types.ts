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

/** Generic eval result — no domain-specific fields. */
export interface BaseIterationResult {
  iterationNumber: number;
  response?: string;
  thinking?: string;
  durationMs: number;
  toolsInvoked: ToolInvocationRecord[];
  error?: string;
  usageInfo?: UsageInfo;
}

/** Security-audit result — extends the generic result with vulnerability markers. */
export interface AuditIterationResult extends BaseIterationResult {
  /** VULN_FOUND marker: model reported a vulnerability. */
  foundVulnerability?: boolean;
  /** VULN_EXPLOITED marker: model reported successful exploitation. */
  exploitedVulnerability?: boolean;
  /** Full assistant response text (audit narrative). */
  vulnerabilitySummary?: string;
  /** Body text rendered in the collapsible exploitation details block. */
  exploitationDetails?: string;
}

/** Backward-compatible alias — existing consumers continue to compile unchanged. */
export type IterationResult = AuditIterationResult;

export interface EvalOptions {
  prompt: string;
  iterations: number;
  model: string;
  mcp?: string;
  /** GitHub PAT for Copilot auth; bypasses gh CLI. Falls back to GITHUB_TOKEN env var. */
  token?: string;
  /** Max ms to wait per iteration (all tool/MCP calls included). Default: 1_200_000 (20 min). */
  iterationTimeoutMs?: number;
  /**
   * Max ms of silence before an iteration is considered stuck.
   * The countdown resets whenever any session event fires (tool call, reasoning
   * delta, usage, etc.). Only triggers when there is genuinely *no* activity.
   * Default: 120_000 (2 min). Set to 0 to disable.
   */
  inactivityTimeoutMs?: number;
}
