import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { IterationResult } from "./types.js";

// ── Helpers ─────────────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Convert Markdown-like fenced code blocks and inline backticks to HTML. */
function formatResponseToHtml(text: string): string {
  // 1. Fenced code blocks: ```lang\n...\n```
  let html = text.replace(
    /```([^\n]*)\n([\s\S]*?)```/g,
    (_match, lang: string, code: string) => {
      const langClass = lang.trim() ? ` class="language-${escapeHtml(lang.trim())}"` : "";
      return `<pre><code${langClass}>${escapeHtml(code)}</code></pre>`;
    }
  );

  // 2. Inline backtick spans: `code`
  html = html.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

  // 3. Convert remaining newlines to <br> outside pre tags
  // Split on <pre> blocks to preserve them verbatim
  const parts = html.split(/(<pre>[\s\S]*?<\/pre>)/);
  html = parts
    .map((part, idx) => {
      if (idx % 2 === 1) return part; // inside a <pre> block
      return part
        .replace(/\n\n+/g, "</p><p>")
        .replace(/\n/g, "<br>");
    })
    .join("");

  return `<p>${html}</p>`;
}

// ── CSS ──────────────────────────────────────────────────────────────────────

function buildCSS(columnCount: number): string {
  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      background: #0d1117;
      color: #e6edf3;
      padding: 24px;
      min-height: 100vh;
    }

    h1 {
      font-size: 1.4rem;
      font-weight: 600;
      margin-bottom: 4px;
      color: #f0f6fc;
    }

    .meta {
      font-size: 0.85rem;
      color: #8b949e;
      margin-bottom: 20px;
    }

    /* ── Summary bar ── */
    .summary {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 14px 20px;
      margin-bottom: 24px;
    }
    .summary-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80px;
    }
    .summary-stat .value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f0f6fc;
    }
    .summary-stat .label {
      font-size: 0.75rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .summary-stat.success .value { color: #3fb950; }
    .summary-stat.error   .value { color: #f85149; }
    .summary-stat.latency .value { color: #d2a8ff; }

    /* ── Prompt display ── */
    .prompt-box {
      background: #161b22;
      border: 1px solid #30363d;
      border-left: 4px solid #1f6feb;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 24px;
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      font-size: 0.85rem;
      color: #cdd9e5;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* ── Grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(${columnCount}, 1fr);
      gap: 16px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
    }

    /* ── Card ── */
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card.card-error { border-color: #6e2b2b; }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: #1c2128;
      border-bottom: 1px solid #30363d;
      gap: 8px;
    }
    .card-title {
      font-weight: 600;
      font-size: 0.9rem;
      color: #e6edf3;
    }
    .card-meta {
      font-size: 0.75rem;
      color: #8b949e;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-success { background: #1a3a1a; color: #3fb950; border: 1px solid #2ea043; }
    .badge-error   { background: #3a1a1a; color: #f85149; border: 1px solid #6e2b2b; }
    .badge-latency { background: #1a1f3a; color: #79c0ff; border: 1px solid #1f6feb; font-variant-numeric: tabular-nums; }

    .card-body {
      padding: 16px;
      flex: 1;
      color: #cdd9e5;
      overflow-x: auto;
    }
    .card-body p { margin-bottom: 0.75em; }
    .card-body p:last-child { margin-bottom: 0; }
    .card-body pre {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      margin: 0.75em 0;
    }
    .card-body pre code {
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      font-size: 0.82rem;
      color: #e6edf3;
      background: none;
      padding: 0;
    }
    .card-body code {
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      font-size: 0.82rem;
      background: #1c2128;
      border: 1px solid #30363d;
      border-radius: 3px;
      padding: 1px 5px;
      color: #e6edf3;
    }
    .error-message {
      color: #f85149;
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      font-size: 0.82rem;
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* ── Card footer (tools) ── */
    .card-footer {
      padding: 10px 16px;
      border-top: 1px solid #30363d;
      background: #1c2128;
    }
    .tools-title {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8b949e;
      margin-bottom: 6px;
    }
    .tool-item {
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      font-size: 0.78rem;
      color: #d2a8ff;
      padding: 4px 0;
      border-bottom: 1px dashed #21262d;
    }
    .tool-item:last-child { border-bottom: none; }
    .tool-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .tool-name { color: #d2a8ff; }
    .tool-duration {
      color: #8b949e;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .tool-detail {
      margin-top: 3px;
    }
    .tool-detail > summary {
      cursor: pointer;
      font-size: 0.72rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      user-select: none;
      list-style: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .tool-detail > summary::before {
      content: "▶";
      font-size: 0.6rem;
      transition: transform 0.15s;
    }
    .tool-detail[open] > summary::before { transform: rotate(90deg); }
    .tool-json {
      margin-top: 4px;
      background: #0d1117;
      border: 1px solid #21262d;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 0.76rem;
      color: #e6edf3;
      white-space: pre-wrap;
      word-break: break-all;
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
    }

    .usage-bar {
      margin-top: 8px;
      font-size: 0.75rem;
      color: #8b949e;
    }
    .usage-bar span { color: #79c0ff; }

    /* ── Thinking / reasoning collapsible ── */
    .thinking-section {
      border-bottom: 1px solid #30363d;
    }
    .thinking-section > summary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      cursor: pointer;
      user-select: none;
      list-style: none;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8b949e;
      background: #161b22;
      transition: background 0.15s;
    }
    .thinking-section > summary:hover { background: #1c2128; }
    .thinking-section > summary::before {
      content: "▶";
      font-size: 0.6rem;
      transition: transform 0.15s;
      flex-shrink: 0;
    }
    .thinking-section[open] > summary::before { transform: rotate(90deg); }
    .thinking-body {
      padding: 12px 16px;
      background: #0d1117;
      border-top: 1px solid #21262d;
      font-size: 0.82rem;
      color: #8b949e;
      font-style: italic;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 360px;
      overflow-y: auto;
      font-family: ui-monospace, "SFMono-Regular", Menlo, monospace;
      line-height: 1.55;
    }

    /* ── Latency bar ── */
    .latency-bar-wrap {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #21262d;
    }
    .latency-bar-label {
      font-size: 0.72rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 5px;
    }
    .latency-bar-track {
      height: 6px;
      background: #21262d;
      border-radius: 4px;
      overflow: hidden;
    }
    .latency-bar-fill {
      height: 100%;
      border-radius: 4px;
      background: linear-gradient(90deg, #1f6feb, #58a6ff);
      transition: width 0.3s ease;
    }
    .latency-bar-fill.slowest { background: linear-gradient(90deg, #b45309, #f0883e); }
    .latency-bar-value {
      font-size: 0.78rem;
      color: #79c0ff;
      margin-top: 4px;
      font-variant-numeric: tabular-nums;
    }
  `.trim();
}

// ── HTML builder ─────────────────────────────────────────────────────────────

function buildHTML(
  results: IterationResult[],
  prompt: string,
  model: string,
  timestamp: string
): string {
  const total = results.length;
  const successes = results.filter((r) => !r.error).length;
  const errors = total - successes;
  const avgLatency =
    successes > 0
      ? Math.round(
          results.filter((r) => !r.error).reduce((sum, r) => sum + r.durationMs, 0) / successes
        )
      : 0;

  const css = buildCSS(total);

  const allDurations = results.map((r) => r.durationMs);
  const minLatency = allDurations.length > 0 ? Math.min(...allDurations) : 0;
  const maxLatency = allDurations.length > 0 ? Math.max(...allDurations) : 0;

  const summaryBar = `
  <div class="summary">
    <div class="summary-stat">
      <span class="value">${total}</span>
      <span class="label">Iterations</span>
    </div>
    <div class="summary-stat success">
      <span class="value">${successes}</span>
      <span class="label">Successful</span>
    </div>
    <div class="summary-stat error">
      <span class="value">${errors}</span>
      <span class="label">Errors</span>
    </div>
    <div class="summary-stat latency">
      <span class="value">${avgLatency.toLocaleString()}ms</span>
      <span class="label">Avg Latency</span>
    </div>
    <div class="summary-stat latency">
      <span class="value">${minLatency.toLocaleString()}ms</span>
      <span class="label">Min Latency</span>
    </div>
    <div class="summary-stat latency">
      <span class="value">${maxLatency.toLocaleString()}ms</span>
      <span class="label">Max Latency</span>
    </div>
  </div>`;

  const cards = results
    .map((result) => {
      const isError = Boolean(result.error);
      const cardClass = isError ? "card card-error" : "card";
      const badge = isError
        ? `<span class="badge badge-error">✗ Error</span>`
        : `<span class="badge badge-success">✓ Success</span>`;

      const bodyContent = isError
        ? `<div class="error-message">${escapeHtml(result.error ?? "Unknown error")}</div>`
        : formatResponseToHtml(result.response ?? "");

      const toolsFooter =
        result.toolsInvoked.length > 0
          ? `
          <div class="card-footer">
            <div class="tools-title">Tools invoked (${result.toolsInvoked.length})</div>
            ${result.toolsInvoked
              .map((t) => {
                const argsJson = t.args !== undefined
                  ? escapeHtml(JSON.stringify(t.args, null, 2))
                  : "(none)";
                const resultJson = t.result === undefined
                  ? "(pending)"
                  : typeof t.result === "string"
                    ? escapeHtml(t.result)
                    : escapeHtml(JSON.stringify(t.result, null, 2));
                return `<div class="tool-item">
              <div class="tool-item-header">
                <span class="tool-name">${escapeHtml(t.toolName)}</span>
                <span class="tool-duration">${t.durationMs.toLocaleString()} ms</span>
              </div>
              <details class="tool-detail">
                <summary>Input</summary>
                <pre class="tool-json">${argsJson}</pre>
              </details>
              <details class="tool-detail">
                <summary>Output</summary>
                <pre class="tool-json">${resultJson}</pre>
              </details>
            </div>`;
              })
              .join("\n            ")}
          </div>`
          : "";

      const thinkingBlock =
        result.thinking
          ? `<details class="thinking-section">
        <summary>Model Thinking</summary>
        <div class="thinking-body">${escapeHtml(result.thinking)}</div>
      </details>`
          : "";

      const usageBar =
        result.usageInfo
          ? `<div class="usage-bar">Tokens: <span>${(result.usageInfo.inputTokens ?? 0).toLocaleString()} in</span> / <span>${(result.usageInfo.outputTokens ?? 0).toLocaleString()} out</span></div>`
          : "";

      // Latency bar: percentage relative to the slowest iteration
      const pct = maxLatency > 0 ? Math.round((result.durationMs / maxLatency) * 100) : 100;
      const isSlowest = result.durationMs === maxLatency && total > 1;
      const latencyBar = `
        <div class="latency-bar-wrap">
          <div class="latency-bar-label">Execution time</div>
          <div class="latency-bar-track">
            <div class="latency-bar-fill${isSlowest ? " slowest" : ""}" style="width:${pct}%"></div>
          </div>
          <div class="latency-bar-value">⏱ ${result.durationMs.toLocaleString()} ms${isSlowest ? "  (slowest)" : ""}</div>
        </div>`;

      return `
    <div class="${cardClass}">
      <div class="card-header">
        <span class="card-title">Iteration ${result.iterationNumber}</span>
        <span class="badge badge-latency">⏱ ${result.durationMs.toLocaleString()} ms</span>
        ${badge}
      </div>
      ${thinkingBlock}
      <div class="card-body">
        ${bodyContent}
        ${usageBar}
        ${latencyBar}
      </div>
      ${toolsFooter}
    </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>eval-copilot report — ${escapeHtml(timestamp)}</title>
  <style>
    ${css}
  </style>
</head>
<body>
  <h1>eval-copilot Report</h1>
  <div class="meta">Model: <strong>${escapeHtml(model)}</strong> &nbsp;·&nbsp; Generated: ${escapeHtml(timestamp)}</div>

  ${summaryBar}

  <div class="prompt-box">${escapeHtml(prompt)}</div>

  <div class="grid">
    ${cards}
  </div>
</body>
</html>`;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateReport(
  results: IterationResult[],
  prompt: string,
  model: string
): Promise<string> {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);
  const filename = `eval_report_${timestamp}.html`;
  const outputPath = join(process.cwd(), filename);

  const html = buildHTML(results, prompt, model, now.toISOString());
  await writeFile(outputPath, html, "utf-8");

  return filename;
}
