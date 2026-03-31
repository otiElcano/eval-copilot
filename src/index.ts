#!/usr/bin/env node
import { Command } from "commander";
import { runEval } from "./runner.js";
import { generateReport } from "./report.js";
import type { EvalOptions } from "./types.js";
import { SdkCopilotClientAdapter } from "./adapters/SdkCopilotClientAdapter.js";
import { OraProgressReporter } from "./adapters/OraProgressReporter.js";
import { AuditPromptTransformer } from "./prompts/AuditPromptTransformer.js";
import { FileSystemReportWriter } from "./adapters/FileSystemReportWriter.js";
import { computeEvalStats } from "./utils/stats.js";


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
  )
  .option(
    "--iteration-timeout <seconds>",
    "Max seconds to wait per iteration (covers all MCP/tool calls). Default: 1200 (20 min).",
    "1200"
  )
  .option(
    "--inactivity-timeout <seconds>",
    "Max seconds of silence before an iteration is considered stuck. Resets on every session event (tool call, reasoning delta, etc.). Default: 120. Set to 0 to disable.",
    "120"
  );

program.parse(process.argv);


const raw = program.opts<{
  prompt: string;
  iterations: string;
  model: string;
  mcp?: string;
  token?: string;
  iterationTimeout: string;
  inactivityTimeout: string;
}>();

const parsedIterations = parseInt(raw.iterations, 10);
if (isNaN(parsedIterations)) {
  console.error(`[eval-copilot] Error: --iterations must be a number, got "${raw.iterations}"`);
  process.exit(1);
}

const resolvedToken = raw.token ?? process.env["GITHUB_TOKEN"];

const parsedTimeout = parseInt(raw.iterationTimeout, 10);
if (isNaN(parsedTimeout) || parsedTimeout < 1) {
  console.error(`[eval-copilot] Error: --iteration-timeout must be a positive integer in seconds, got "${raw.iterationTimeout}"`);
  process.exit(1);
}

const parsedInactivityTimeout = parseInt(raw.inactivityTimeout, 10);
if (isNaN(parsedInactivityTimeout) || parsedInactivityTimeout < 0) {
  console.error(`[eval-copilot] Error: --inactivity-timeout must be a non-negative integer in seconds, got "${raw.inactivityTimeout}"`);
  process.exit(1);
}

const options: EvalOptions = {
  prompt:               raw.prompt,
  iterations:           Math.max(1, parsedIterations),
  model:                raw.model,
  mcp:                  raw.mcp,
  token:                resolvedToken,
  iterationTimeoutMs:   parsedTimeout * 1000,
  inactivityTimeoutMs:  parsedInactivityTimeout * 1000,
};

function printBanner(opts: EvalOptions): void {
  const truncatedPrompt =
    opts.prompt.length > 80 ? opts.prompt.slice(0, 77) + "..." : opts.prompt;

  console.log(`\n🔁  eval-copilot`);
  console.log(`   Prompt     : ${truncatedPrompt}`);
  console.log(`   Model      : ${opts.model}`);
  console.log(`   Iterations : ${opts.iterations}`);
  if (opts.mcp)   console.log(`   MCP config : ${opts.mcp}`);
  console.log(`   Auth       : ${opts.token ? "GitHub token (--token / GITHUB_TOKEN)" : "gh CLI credentials"}`);
  console.log(`   Iter. timeout    : ${(opts.iterationTimeoutMs ?? 1_200_000) / 1000}s`);
  const inactSecs = (opts.inactivityTimeoutMs ?? 120_000) / 1000;
  console.log(`   Inact. timeout   : ${inactSecs > 0 ? `${inactSecs}s` : "disabled"}`);
  console.log();
}

async function main(): Promise<void> {
  printBanner(options);

  const clientAdapter     = new SdkCopilotClientAdapter(options.token);
  const progressReporter  = new OraProgressReporter();
  const promptTransformer = new AuditPromptTransformer();
  const reportWriter      = new FileSystemReportWriter();

  let results: Awaited<ReturnType<typeof runEval>>;
  try {
    results = await runEval(options, clientAdapter, progressReporter, promptTransformer);
  } catch (err) {
    console.error(`\n[eval-copilot] Fatal error: ${(err as Error).message ?? String(err)}`);
    process.exit(1);
  }

  const { successes, errors, avgLatency } = computeEvalStats(results);
  const vulnFound     = results.filter((r) => r.foundVulnerability).length;
  const vulnExploited = results.filter((r) => r.exploitedVulnerability).length;

  console.log();
  console.log(`── Summary ─────────────────────────────────`);
  console.log(`   Total iterations : ${results.length}`);
  console.log(`   Successful       : ${successes}`);
  console.log(`   Errors           : ${errors}`);
  console.log(`   Avg latency      : ${avgLatency.toLocaleString()}ms`);
  console.log(`   VULN_FOUND       : ${vulnFound}/${results.length} iterations`);
  console.log(`   VULN_EXPLOITED   : ${vulnExploited}/${results.length} iterations`);
  console.log();

  let reportFile: string;
  try {
    reportFile = await generateReport(results, options.prompt, options.model, reportWriter);
  } catch (err) {
    console.error(`[eval-copilot] Failed to write report: ${(err as Error).message ?? String(err)}`);
    process.exit(1);
  }

  console.log(`📄  Report generated: ${reportFile}`);
  console.log();
}

main();
