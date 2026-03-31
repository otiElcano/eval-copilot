import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { IReportWriter } from "../interfaces/IReportWriter.js";

/**
 * Writes the HTML report to disk inside the current working directory.
 * Implements IReportWriter so report.ts never touches node:fs/promises directly.
 */
export class FileSystemReportWriter implements IReportWriter {
  async write(html: string, timestamp: string): Promise<string> {
    const filename = `eval_report_${timestamp}.html`;
    const outputPath = join(process.cwd(), filename);
    await writeFile(outputPath, html, "utf-8");
    return filename;
  }
}
