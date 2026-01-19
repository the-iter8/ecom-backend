export default class Logger {
  constructor(private context: string) {}

  info(message: string, meta?: any): void {
    console.log(
      `[INFO] [${this.context}] ${message}`,
      meta ? JSON.stringify(meta) : "",
    );
  }

  error(message: string, meta?: any): void {
    console.error(
      `[ERROR] [${this.context}] ${message}`,
      meta ? JSON.stringify(meta) : "",
    );
  }

  warn(message: string, meta?: any): void {
    console.warn(
      `[WARN] [${this.context}] ${message}`,
      meta ? JSON.stringify(meta) : "",
    );
  }

  debug(message: string, meta?: any): void {
    console.debug(
      `[DEBUG] [${this.context}] ${message}`,
      meta ? JSON.stringify(meta) : "",
    );
  }
}
