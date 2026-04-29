import ora, { type Ora } from "ora";
import type { IProgressReporter } from "../interfaces/IProgressReporter.js";

/**
 * IProgressReporter implementation backed by an `ora` terminal spinner.
 * Encapsulates all ora state so callers never import ora directly.
 */
export class OraProgressReporter implements IProgressReporter {
  private spinner: Ora | undefined;

  start(label: string): void {
    this.spinner = ora(label).start();
  }

  succeed(label: string): void {
    if (this.spinner) {
      this.spinner.succeed(label);
    } else {
      console.log(`✔ ${label}`);
    }
  }

  fail(label: string): void {
    if (this.spinner) {
      this.spinner.fail(label);
    } else {
      console.error(`✖ ${label}`);
    }
  }
}
