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
    "--disable-tool <name>",
    "Disable a specific tool by name — native or MCP (repeatable). Always wins over --allow-tool.",
    (value: string, previous: string[]) => previous.concat([value]),
    [] as string[]
  )
  .option(
    "--allow-tool <name>",
    "Whitelist a tool by name (repeatable). When at least one --allow-tool is given, ALL other tools are denied unless also listed. --disable-tool overrides this.",
    (value: string, previous: string[]) => previous.concat([value]),
    [] as string[]
  )
  .option(
    "--stream",
    "Print each iteration's output to the terminal in real-time as it is generated",
    false
  );

program.parse(process.argv);

// ── Options parsing & validation ──────────────────────────────────────────────

const raw = program.opts<{
  prompt: string;
  iterations: string;
  model: string;
  mcp?: string;
  disableTool: string[];
  allowTool: string[];
  stream: boolean;
}>();

const parsedIterations = parseInt(raw.iterations, 10);
if (isNaN(parsedIterations)) {
  console.error(`[eval-copilot] Error: --iterations must be a number, got "${raw.iterations}"`);
  process.exit(1);
}

const options: EvalOptions = {
  prompt:       raw.prompt,
  iterations:   Math.max(1, parsedIterations),
  model:        raw.model,
  mcp:          raw.mcp,
  disabledTools: raw.disableTool,
  allowedTools:  raw.allowTool,
  stream:        raw.stream,
};

// ── Startup banner ────────────────────────────────────────────────────────────

function printBanner(opts: EvalOptions): void {
  const truncatedPrompt =
    opts.prompt.length > 80 ? opts.prompt.slice(0, 77) + "..." : opts.prompt;

  console.log(`\n🔁  eval-copilot`);
  console.log(`   Prompt     : ${truncatedPrompt}`);
  console.log(`   Model      : ${opts.model}`);
  console.log(`   Iterations : ${opts.iterations}`);
  if (opts.mcp)                       console.log(`   MCP config : ${opts.mcp}`);
  if (opts.allowedTools.length > 0)   console.log(`   Allowed tools : ${opts.allowedTools.join(", ")} (whitelist — all others denied)`);
  if (opts.disabledTools.length > 0)  console.log(`   Disabled tools: ${opts.disabledTools.join(", ")}`);
  if (opts.stream)                    console.log(`   Streaming  : enabled`);
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
  console.log(`── Summary ─────────────────────────────────`);
  console.log(`   Total iterations : ${results.length}`);
  console.log(`   Successful       : ${successes}`);
  console.log(`   Errors           : ${errors}`);
  console.log(`   Avg latency      : ${avgLatency.toLocaleString()}ms`);
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
