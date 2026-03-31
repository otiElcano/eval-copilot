/** Abstracts terminal progress feedback (spinner, log lines). */
export interface IProgressReporter {
  start(label: string): void;
  succeed(label: string): void;
  fail(label: string): void;
}
