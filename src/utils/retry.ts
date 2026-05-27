import { logging } from "./logging";
 
export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  opts: {
    maxRetries: 5;
    baseDelayMs: 1000;
    maxDelayMs: 30000;
    shouldRetry: (err: unknown) => { retry: boolean; waitMs?: number; reason?: string };
  }
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const decision = opts.shouldRetry(err);
      if (!decision.retry || attempt > opts.maxRetries) {
        throw err;
      }
      const exp = opts.baseDelayMs * Math.pow(2, attempt - 1);
      const wait = Math.min(decision.waitMs ?? exp, opts.maxDelayMs);
      logging.warn('retrying request', { attempt, waitMs: wait, reason: decision.reason });
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}