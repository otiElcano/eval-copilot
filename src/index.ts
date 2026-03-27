#!/usr/bin/env node
import { Command } from "commander";
import { runEval } from "./runner.js";
import { generateReport } from "./report.js";
import type { EvalOptions } from "./types.js";

// ── CLI definition ────────────────────────────────────────────────────────────

const program = new Command();

program
  .name("eval-copilot")
  .description(
    "Run a prompt N times via GitHub Copilot and generate a side-by-side HTML comparison report."
  )
  .version("1.0.0")
  .requiredOption("-p, --prompt <text>", "The prompt text to evaluate (required)")
  .option("-x, --iterations <number>", "Number of times to run the prompt", "3")
  .option(
    "-m, --model <name>",
    "Model to use (e.g. gpt-4.1, claude-sonnet-4.5). Validated against available models.",
    "gpt-4.1"
  )
  .option("--mcp <path>", "Path to an MCP server configuration JSON file")
  .option(
    "--token <tok>",
    "GitHub PAT with Copilot access (bypasses gh CLI auth). Falls back to GITHUB_TOKEN env var."
  );

program.parse(process.argv);

// ── Options parsing & validation ──────────────────────────────────────────────

const raw = program.opts<{
  prompt: string;
  iterations: string;
  model: string;
  mcp?: string;
  token?: string;
}>();

const parsedIterations = parseInt(raw.iterations, 10);
if (isNaN(parsedIterations)) {
  console.error(`[eval-copilot] Error: --iterations must be a number, got "${raw.iterations}"`);
  process.exit(1);
}

// Resolve token: --token flag > GITHUB_TOKEN env var > undefined (gh CLI fallback)
const resolvedToken = raw.token ?? process.env["GITHUB_TOKEN"];

const options: EvalOptions = {
  prompt:     raw.prompt,
  iterations: Math.max(1, parsedIterations),
  model:      raw.model,
  mcp:        raw.mcp,
  token:      resolvedToken,
};

// ── Startup banner ────────────────────────────────────────────────────────────

function printBanner(opts: EvalOptions): void {
  const truncatedPrompt =
    opts.prompt.length > 80 ? opts.prompt.slice(0, 77) + "..." : opts.prompt;

  console.log(`\n🔁  eval-copilot`);
  console.log(`   Prompt     : ${truncatedPrompt}`);
  console.log(`   Model      : ${opts.model}`);
  console.log(`   Iterations : ${opts.iterations}`);
  if (opts.mcp)   console.log(`   MCP config : ${opts.mcp}`);
  console.log(`   Auth       : ${opts.token ? "GitHub token (--token / GITHUB_TOKEN)" : "gh CLI credentials"}`);
  console.log();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  printBanner(options);

  let results: Awaited<ReturnType<typeof runEval>>;
  try {
    results = await runEval(options);
  } catch (err) {
    console.error(`\n[eval-copilot] Fatal error: ${(err as Error).message ?? String(err)}`);
    process.exit(1);
  }

  // ── Terminal summary ──────────────────────────────────────────────────────
  const successes = results.filter((r) => !r.error).length;
  const errors    = results.length - successes;
  const avgLatency =
    successes > 0
      ? Math.round(
          results
            .filter((r) => !r.error)
            .reduce((sum, r) => sum + r.durationMs, 0) / successes
        )
      : 0;

  console.log();
  const vulnFound    = results.filter((r) => r.foundVulnerability).length;
  const vulnExploited = results.filter((r) => r.exploitedVulnerability).length;

  console.log(`── Summary ─────────────────────────────────`);
  console.log(`   Total iterations : ${results.length}`);
  console.log(`   Successful       : ${successes}`);
  console.log(`   Errors           : ${errors}`);
  console.log(`   Avg latency      : ${avgLatency.toLocaleString()}ms`);
  console.log(`   VULN_FOUND       : ${vulnFound}/${results.length} iterations`);
  console.log(`   VULN_EXPLOITED   : ${vulnExploited}/${results.length} iterations`);
  console.log();

  // ── HTML report ───────────────────────────────────────────────────────────
  let reportFile: string;
  try {
    reportFile = await generateReport(results, options.prompt, options.model);
  } catch (err) {
    console.error(`[eval-copilot] Failed to write report: ${(err as Error).message ?? String(err)}`);
    process.exit(1);
  }

  console.log(`📄  Report generated: ${reportFile}`);
  console.log();
}

main();
