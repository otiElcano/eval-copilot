/** Persists a rendered HTML report and returns the saved file path / name. */
export interface IReportWriter {
  write(html: string, timestamp: string): Promise<string>;
}
