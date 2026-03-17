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
  /** Whether the model reported a vulnerability was found (VULN_FOUND marker). */
  foundVulnerability?: boolean;
  /** Whether the model reported successful exploitation (VULN_EXPLOITED marker). */
  exploitedVulnerability?: boolean;
  /** Lines 3+ of the assistant response — the main audit narrative. */
  vulnerabilitySummary?: string;
  /** Same content as vulnerabilitySummary; rendered separately as a collapsible exploitation details block. */
  exploitationDetails?: string;
}

export interface EvalOptions {
  prompt: string;
  iterations: number;
  model: string;
  mcp?: string;
}
