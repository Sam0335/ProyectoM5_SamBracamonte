import { logging } from './logging';
import { AppError } from './types';

export async function withExponentialBackoff<T>(
    fn: () => Promise<T>,
    opts: {
        maxRetries: number;
        baseDelayMs: number;
        maxDelayMs: number;
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

            logging.warn('Reintentando request', {
                attempt,
                maxRetries: opts.maxRetries,
                waitMs: wait,
                reason: decision.reason,
            });

            await new Promise((r) => setTimeout(r, wait));
        }
    }
}

// Helper que decide si un error de GitHub merece reintento
export function shouldRetryGitHub(err: unknown): { retry: boolean; waitMs?: number; reason?: string } {
    if (err instanceof AppError) {
        if (err.retryable) {
            // Si GitHub nos dice cuánto esperar, lo usamos
            const resetTime = (err.details as any)?.rateLimitReset;
            const waitMs = resetTime
                ? (resetTime * 1000 - Date.now())
                : undefined;

            return { retry: true, waitMs, reason: err.code };
        }
        return { retry: false };
    }
    return { retry: false };
}