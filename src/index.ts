#!/usr/bin/env node
import { Command } from "commander";
import { runEval } from "./runner.js";
import { generateReport } from "./report.js";
import type { EvalOptions } from "./types.js";

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
    "--disable-native-tools",
    "Block native Copilot tools (workspace search, etc.) via onPreToolUse hook",
    false
  );

program.parse(process.argv);

const rawOpts = program.opts<{
  prompt: string;
  iterations: string;
  model: string;
  mcp?: string;
  disableNativeTools: boolean;
}>();

const options: EvalOptions = {
  prompt: rawOpts.prompt,
  iterations: Math.max(1, parseInt(rawOpts.iterations, 10) || 3),
  model: rawOpts.model,
  mcp: rawOpts.mcp,
  disableNativeTools: rawOpts.disableNativeTools,
};

// ── Validate iterations ───────────────────────────────────────────────────────
if (isNaN(parseInt(rawOpts.iterations, 10))) {
  console.error(`[eval-copilot] Error: --iterations must be a number, got "${rawOpts.iterations}"`);
  process.exit(1);
}

console.log(`\n🔁  eval-copilot`);
console.log(`   Prompt     : ${options.prompt.length > 80 ? options.prompt.slice(0, 77) + "..." : options.prompt}`);
console.log(`   Model      : ${options.model}`);
console.log(`   Iterations : ${options.iterations}`);
if (options.mcp) console.log(`   MCP config : ${options.mcp}`);
if (options.disableNativeTools) console.log(`   Native tools: DISABLED`);
console.log();

(async () => {
  let results: Awaited<ReturnType<typeof runEval>>;

  try {
    results = await runEval(options);
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    console.error(`\n[eval-copilot] Fatal error: ${message}`);
    process.exit(1);
  }

  // ── Terminal summary ────────────────────────────────────────────────────────
  const successes = results.filter((r) => !r.error).length;
  const errors = results.length - successes;
  const avgLatency =
    successes > 0
      ? Math.round(
          results
            .filter((r) => !r.error)
            .reduce((sum, r) => sum + r.durationMs, 0) / successes
        )
      : 0;

  console.log();
  console.log(`── Summary ─────────────────────────────────`);
  console.log(`   Total iterations : ${results.length}`);
  console.log(`   Successful       : ${successes}`);
  console.log(`   Errors           : ${errors}`);
  console.log(`   Avg latency      : ${avgLatency.toLocaleString()}ms`);
  console.log();

  // ── Generate HTML report ────────────────────────────────────────────────────
  let reportFile: string;
  try {
    reportFile = await generateReport(results, options.prompt, options.model);
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    console.error(`[eval-copilot] Failed to write report: ${message}`);
    process.exit(1);
  }

  console.log(`📄  Report generated: ${reportFile}`);
  console.log();
})();
