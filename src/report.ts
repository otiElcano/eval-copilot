import type { IterationResult } from "./types.js";
import type { IReportWriter } from "./interfaces/IReportWriter.js";
import { FileSystemReportWriter } from "./adapters/FileSystemReportWriter.js";
import { computeEvalStats } from "./utils/stats.js";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatResponseToHtml(text: string): string {
  let html = text.replace(
    /```([^\n]*)\n([\s\S]*?)```/g,
    (_match, lang: string, code: string) => {
      const langClass = lang.trim() ? ` class="language-${escapeHtml(lang.trim())}"` : "";
      return `<pre><code${langClass}>${escapeHtml(code)}</code></pre>`;
    }
  );

  html = html.replace(/`([^`\n]+)`/g, (_match, code: string) => {
    return `<code>${escapeHtml(code)}</code>`;
  });

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


function buildCSS(): string {
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

    /* ── Accordion controls ── */
    .accordion-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .accordion-btn {
      padding: 4px 14px;
      font-size: 0.78rem;
      font-weight: 600;
      border-radius: 6px;
      border: 1px solid #30363d;
      background: #1c2128;
      color: #8b949e;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .accordion-btn:hover { background: #30363d; color: #e6edf3; }

    /* ── Iterations list ── */
    .iterations {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* ── Accordion item (replaces .card) ── */
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      overflow: hidden;
    }
    .card.card-error { border-color: #6e2b2b; }

    /* ── Accordion summary row (always visible) ── */
    .card > summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: #1c2128;
      cursor: pointer;
      user-select: none;
      list-style: none;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .card[open] > summary {
      border-bottom: 1px solid #30363d;
      border-radius: 8px 8px 0 0;
    }
    .card > summary:hover { background: #21262d; }
    .card.card-error > summary { background: #1e1414; }
    .card.card-error[open] > summary { background: #1e1414; }
    .card > summary::marker, .card > summary::-webkit-details-marker { display: none; }
    .summary-chevron {
      font-size: 0.65rem;
      color: #8b949e;
      transition: transform 0.2s;
      flex-shrink: 0;
      margin-right: 2px;
    }
    .card[open] > summary .summary-chevron { transform: rotate(90deg); }
    .summary-iter-num {
      font-weight: 700;
      font-size: 0.9rem;
      color: #e6edf3;
      min-width: 90px;
      flex-shrink: 0;
    }
    .summary-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      flex: 1;
    }
    .summary-preview {
      font-size: 0.78rem;
      color: #8b949e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 340px;
      flex: 1;
    }

    /* ── Accordion body ── */
    .accordion-body {
      display: flex;
      flex-direction: column;
    }

    .card-header {
      display: none;
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

    /* ── Vuln badge row ── */
    .vuln-row {
      display: flex;
      gap: 8px;
      padding: 8px 16px;
      background: #161b22;
      border-bottom: 1px solid #30363d;
      flex-wrap: wrap;
    }
    .badge-vuln-found-true  { background: #1a3a1a; color: #3fb950; border: 1px solid #2ea043; }
    .badge-vuln-found-false { background: #3a1a1a; color: #f85149; border: 1px solid #6e2b2b; }
    .badge-vuln-exploited-true  { background: #1a3a1a; color: #3fb950; border: 1px solid #2ea043; }
    .badge-vuln-exploited-false { background: #1a1f3a; color: #8b949e; border: 1px solid #30363d; }

    /* ── Exploitation details collapsible ── */
    .exploit-section {
      border-top: 1px solid #30363d;
    }
    .exploit-section > summary {
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
    .exploit-section > summary:hover { background: #1c2128; }
    .exploit-section > summary::before {
      content: "▶";
      font-size: 0.6rem;
      transition: transform 0.15s;
      flex-shrink: 0;
    }
    .exploit-section[open] > summary::before { transform: rotate(90deg); }
    .exploit-body {
      padding: 12px 16px;
      background: #0d1117;
      border-top: 1px solid #21262d;
      font-size: 0.82rem;
      color: #cdd9e5;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 400px;
      overflow-y: auto;
    }

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

function buildHTML(
  results: IterationResult[],
  prompt: string,
  model: string,
  timestamp: string
): string {
  const { total, successes, errors, avgLatency, minLatency, maxLatency } = computeEvalStats(results);
  const vulnFound     = results.filter((r) => r.foundVulnerability).length;
  const vulnExploited = results.filter((r) => r.exploitedVulnerability).length;

  const css = buildCSS();

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
    <div class="summary-stat success">
      <span class="value">${vulnFound}/${total}</span>
      <span class="label">Vuln Found</span>
    </div>
    <div class="summary-stat${vulnExploited > 0 ? " error" : ""}">
      <span class="value">${vulnExploited}/${total}</span>
      <span class="label">Exploited</span>
    </div>
  </div>`;

  const cards = results
    .map((result, idx) => {
      const isError = Boolean(result.error);
      const cardClass = isError ? "card card-error" : "card";
      const badge = isError
        ? `<span class="badge badge-error">✗ Error</span>`
        : `<span class="badge badge-success">✓ Success</span>`;
      const isFirstIteration = idx === 0;

      const foundLabel    = result.foundVulnerability    ? "✅ VULN_FOUND"    : "❌ VULN_FOUND";
      const exploitLabel  = result.exploitedVulnerability ? "✅ VULN_EXPLOITED" : "❌ VULN_EXPLOITED";
      const foundClass    = result.foundVulnerability    ? "badge badge-vuln-found-true"    : "badge badge-vuln-found-false";
      const exploitClass  = result.exploitedVulnerability ? "badge badge-vuln-exploited-true" : "badge badge-vuln-exploited-false";
      const vulnRow = !isError ? `
      <div class="vuln-row">
        <span class="${escapeHtml(foundClass)}">${escapeHtml(foundLabel)}</span>
        <span class="${escapeHtml(exploitClass)}">${escapeHtml(exploitLabel)}</span>
      </div>` : "";

      const summaryText = result.vulnerabilitySummary ?? result.response ?? "";
      const bodyContent = isError
        ? `<div class="error-message">${escapeHtml(result.error ?? "Unknown error")}</div>`
        : formatResponseToHtml(summaryText);

      const exploitBlock =
        !isError && result.exploitationDetails
          ? `<details class="exploit-section">
        <summary>Exploitation Details</summary>
        <div class="exploit-body">${formatResponseToHtml(result.exploitationDetails)}</div>
      </details>`
          : "";

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

      const previewText = isError
        ? `Error: ${result.error ?? "Unknown error"}`
        : (result.vulnerabilitySummary ?? result.response ?? "").slice(0, 120).replace(/\n/g, " ");
      const escapedPreview = escapeHtml(previewText + (previewText.length >= 120 ? "…" : ""));

      const openAttr = isFirstIteration ? " open" : "";

      return `
    <details class="${cardClass}"${openAttr}>
      <summary>
        <span class="summary-chevron">▶</span>
        <span class="summary-iter-num">Iteration ${result.iterationNumber}</span>
        <span class="summary-badges">
          <span class="badge badge-latency">⏱ ${result.durationMs.toLocaleString()} ms</span>
          ${badge}
          ${!isError ? `<span class="${escapeHtml(result.foundVulnerability ? "badge badge-vuln-found-true" : "badge badge-vuln-found-false")}">${escapeHtml(result.foundVulnerability ? "✅ VULN_FOUND" : "❌ VULN_FOUND")}</span>` : ""}
          ${!isError ? `<span class="${escapeHtml(result.exploitedVulnerability ? "badge badge-vuln-exploited-true" : "badge badge-vuln-exploited-false")}">${escapeHtml(result.exploitedVulnerability ? "✅ VULN_EXPLOITED" : "❌ VULN_EXPLOITED")}</span>` : ""}
        </span>
        <span class="summary-preview">${escapedPreview}</span>
      </summary>
      <div class="accordion-body">
      <div class="card-header">
        <span class="card-title">Iteration ${result.iterationNumber}</span>
        <span class="badge badge-latency">⏱ ${result.durationMs.toLocaleString()} ms</span>
        ${badge}
      </div>
      ${vulnRow}
      ${thinkingBlock}
      <div class="card-body">
        ${bodyContent}
        ${usageBar}
        ${latencyBar}
      </div>
      ${exploitBlock}
      ${toolsFooter}
      </div>
    </details>`;
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

  <div class="accordion-controls">
    <button class="accordion-btn" onclick="document.querySelectorAll('.iterations details').forEach(d=>d.open=true)">Expand all</button>
    <button class="accordion-btn" onclick="document.querySelectorAll('.iterations details').forEach(d=>d.open=false)">Collapse all</button>
  </div>
  <div class="iterations">
    ${cards}
  </div>
</body>
</html>`;
}


/**
 * Generates an HTML report from iteration results.
 *
 * @param writer - Optional IReportWriter. Defaults to FileSystemReportWriter (writes to cwd).
 */
export async function generateReport(
  results: IterationResult[],
  prompt: string,
  model: string,
  writer?: IReportWriter,
): Promise<string> {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19);

  const html = buildHTML(results, prompt, model, now.toISOString());

  const reportWriter = writer ?? new FileSystemReportWriter();
  return reportWriter.write(html, timestamp);
}
