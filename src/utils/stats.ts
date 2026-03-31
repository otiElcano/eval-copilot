import type { BaseIterationResult } from "../types.js";

export interface EvalStats {
  total: number;
  successes: number;
  errors: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
}

/**
 * Computes summary statistics from a list of iteration results.
 * Works with any result type that satisfies BaseIterationResult.
 */
export function computeEvalStats(results: BaseIterationResult[]): EvalStats {
  const total = results.length;
  const successes = results.filter((r) => !r.error).length;
  const errors = total - successes;

  const successfulDurations = results
    .filter((r) => !r.error)
    .map((r) => r.durationMs);

  const avgLatency =
    successfulDurations.length > 0
      ? Math.round(successfulDurations.reduce((sum, d) => sum + d, 0) / successfulDurations.length)
      : 0;

  const allDurations = results.map((r) => r.durationMs);
  const minLatency = allDurations.length > 0 ? Math.min(...allDurations) : 0;
  const maxLatency = allDurations.length > 0 ? Math.max(...allDurations) : 0;

  return { total, successes, errors, avgLatency, minLatency, maxLatency };
}
