import type { ISession } from "./interfaces/ICopilotClientAdapter.js";

function truncate(text: string, max = 160): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

function stringifyUnknown(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function summarizeEventData(event: unknown): string {
  const e = event as { type?: string; data?: Record<string, unknown> };
  const type = e?.type ?? "unknown";
  const data = e?.data ?? {};

  switch (type) {
    case "assistant.message": {
      const content = typeof data["content"] === "string" ? data["content"] : "";
      const toolRequests = Array.isArray(data["toolRequests"]) ? data["toolRequests"].length : 0;
      return `chars=${content.length} toolRequests=${toolRequests}`;
    }
    case "assistant.message_delta":
    case "assistant.reasoning_delta": {
      const delta = typeof data["deltaContent"] === "string" ? data["deltaContent"] : "";
      return `deltaChars=${delta.length} preview=${JSON.stringify(truncate(delta, 80))}`;
    }
    case "assistant.reasoning": {
      const content = typeof data["content"] === "string" ? data["content"] : "";
      return `chars=${content.length}`;
    }
    case "assistant.usage":
      return `model=${String(data["model"] ?? "unknown")} input=${String(data["inputTokens"] ?? "?")} output=${String(data["outputTokens"] ?? "?")}`;
    case "tool.execution_start":
      return [
        `tool=${String(data["toolName"] ?? "unknown")}`,
        `id=${String(data["toolCallId"] ?? "")}`,
        data["arguments"] !== undefined
          ? `args=${JSON.stringify(truncate(stringifyUnknown(data["arguments"]), 160))}`
          : "",
      ].filter(Boolean).join(" ");
    case "tool.execution_complete": {
      const result = data["result"] as { content?: string; detailedContent?: string } | undefined;
      const resultText = typeof result?.detailedContent === "string"
        ? result.detailedContent
        : typeof result?.content === "string"
          ? result.content
          : "";
      const errorText = data["error"] !== undefined
        ? truncate(stringifyUnknown(data["error"]), 120)
        : "";
      return [
        `tool=${String(data["toolName"] ?? "unknown")}`,
        `id=${String(data["toolCallId"] ?? "")}`,
        `success=${String(data["success"] ?? "?")}`,
        errorText ? `error=${JSON.stringify(errorText)}` : "",
        resultText ? `resultChars=${resultText.length}` : "",
      ].filter(Boolean).join(" ");
    }
    case "permission.requested": {
      const req = data["permissionRequest"] as { kind?: string } | undefined;
      return [
        `requestId=${String(data["requestId"] ?? "")}`,
        `kind=${String(req?.kind ?? "unknown")}`,
        req ? `request=${JSON.stringify(truncate(stringifyUnknown(req), 180))}` : "",
      ].filter(Boolean).join(" ");
    }
    case "session.error":
      return `message=${JSON.stringify(truncate(String(data["message"] ?? ""), 160))}`;
    case "session.idle": {
      const tasks = Array.isArray(data["backgroundTasks"]) ? data["backgroundTasks"].length : 0;
      return `backgroundTasks=${tasks}`;
    }
    case "assistant.turn_start":
      return `turnId=${String(data["turnId"] ?? "")}`;
    default: {
      const raw = truncate(stringifyUnknown(data), 220);
      return raw === "{}" ? "" : raw;
    }
  }
}

/**
 * Logs all SDK session events to stderr for live debugging.
 */
export class SessionEventTracer {
  private readonly session: ISession;
  private readonly prefix: string;
  private unsubscribe: (() => void) | undefined;

  constructor(session: ISession, prefix: string) {
    this.session = session;
    this.prefix  = prefix;
  }

  attach(): void {
    this.unsubscribe = this.session.on((event: unknown) => {
      const type = (event as { type?: string } | undefined)?.type ?? "unknown";
      const summary = summarizeEventData(event);
      const suffix = summary ? ` ${summary}` : "";
      console.error(`[trace ${this.prefix}] ${new Date().toISOString()} ${type}${suffix}`);
    });
  }

  detach(): void {
    this.unsubscribe?.();
    this.unsubscribe = undefined;
  }
}