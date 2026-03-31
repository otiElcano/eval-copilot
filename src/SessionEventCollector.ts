import type { ISession } from "./interfaces/ICopilotClientAdapter.js";
import type { ToolInvocationRecord, UsageInfo } from "./types.js";

export interface CollectedSessionData {
  toolsInvoked: ToolInvocationRecord[];
  thinking: string | undefined;
  usageInfo: UsageInfo | undefined;
}

/**
 * Attaches to an ISession and collects all tool-execution, reasoning, and
 * usage events into plain data structures.
 *
 * Responsibilities (SRP):
 *   - Register event listeners on attach()
 *   - Accumulate state from events
 *   - Unregister listeners on detach()
 *   - Expose collected data via getResults()
 */
export class SessionEventCollector {
  private readonly session: ISession;

  private readonly toolsInvoked: ToolInvocationRecord[] = [];
  private readonly toolCallIdToIndex = new Map<string, number>();
  private readonly toolStartTimes    = new Map<string, number>();
  private readonly thinkingParts     : string[]          = [];
  private readonly reasoningDeltaMap = new Map<string, string>();
  private usageInfo: UsageInfo | undefined;

  private unsubscribers: Array<() => void> = [];

  constructor(session: ISession) {
    this.session = session;
  }

  attach(): void {
    this.unsubscribers.push(
      this.session.on("tool.execution_start", (event: unknown) => {
        const e = event as { data?: { toolCallId?: string; toolName?: string; arguments?: unknown } };
        const toolCallId = e?.data?.toolCallId ?? "";
        const toolName   = e?.data?.toolName   ?? "unknown";
        const idx = this.toolsInvoked.length;
        this.toolsInvoked.push({ toolName, args: e?.data?.arguments, durationMs: 0 });
        this.toolCallIdToIndex.set(toolCallId, idx);
        this.toolStartTimes.set(toolCallId, Date.now());
      }),

      this.session.on("tool.execution_complete", (event: unknown) => {
        type CompleteEvent = {
          data?: {
            toolCallId?: string;
            success?: boolean;
            error?: string;
            errorMessage?: string;
            reason?: string;
            result?: { content?: string; detailedContent?: string };
          };
        };
        const e = event as CompleteEvent;
        const toolCallId = e?.data?.toolCallId ?? "";
        const idx = this.toolCallIdToIndex.get(toolCallId);
        if (idx === undefined) return;

        const t   = this.toolsInvoked[idx];
        const raw = e?.data?.result;

        if (raw !== undefined) {
          t.result = raw.detailedContent ?? raw.content ?? raw;
        } else if (e?.data?.success === false) {
          const errorDetail = e?.data?.error ?? e?.data?.errorMessage ?? e?.data?.reason;
          t.result = errorDetail ? `(error: ${errorDetail})` : "(execution failed)";
        } else {
          t.result = "(no output)";
        }

        const startTime = this.toolStartTimes.get(toolCallId);
        t.durationMs = startTime !== undefined ? Date.now() - startTime : 0;
        this.toolCallIdToIndex.delete(toolCallId);
        this.toolStartTimes.delete(toolCallId);
      }),

      this.session.on("assistant.reasoning", (event: unknown) => {
        const e = event as { data?: { reasoningId?: string; content?: string } };
        const content = e?.data?.content;
        if (content) {
          if (e?.data?.reasoningId) this.reasoningDeltaMap.delete(e.data.reasoningId);
          this.thinkingParts.push(content);
        }
      }),

      this.session.on("assistant.reasoning_delta", (event: unknown) => {
        const e = event as { data?: { reasoningId?: string; deltaContent?: string } };
        const id    = e?.data?.reasoningId ?? "__default__";
        const delta = e?.data?.deltaContent;
        if (delta) {
          this.reasoningDeltaMap.set(id, (this.reasoningDeltaMap.get(id) ?? "") + delta);
        }
      }),

      this.session.on("assistant.usage", (event: unknown) => {
        const e = event as { data: { model: string; inputTokens?: number; outputTokens?: number } };
        this.usageInfo = {
          model:        e.data.model,
          inputTokens:  e.data.inputTokens,
          outputTokens: e.data.outputTokens,
        };
      }),
    );
  }

  detach(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
  }

  /** Merges accumulated reasoning deltas and returns all collected data. */
  getResults(): CollectedSessionData {
    for (const accumulated of this.reasoningDeltaMap.values()) {
      if (accumulated && !this.thinkingParts.includes(accumulated)) {
        this.thinkingParts.push(accumulated);
      }
    }
    return {
      toolsInvoked: [...this.toolsInvoked],
      thinking:     this.thinkingParts.length > 0 ? this.thinkingParts.join("\n\n") : undefined,
      usageInfo:    this.usageInfo,
    };
  }
}
