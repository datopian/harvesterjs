import { env } from "../../config";

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string
): Promise<T> {
  let attempt = 0;
  const max = env.RETRY_MAX_ATTEMPTS;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= max) throw err;
      const backoff = env.RETRY_BASE_MS * 2 ** (attempt - 1);
      console.warn(
        `[retry] ${label} failed (attempt ${attempt}/${max}). Backing off ${backoff}ms`
      );
      await sleep(backoff);
    }
  }
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const buildOrFq = (key: string, values: string[]) =>
  `${key}:(${values.join(" OR ")})`;

export function serializeError(e: unknown): string {
  if (e instanceof Error) {
    const { name, message, stack, ...rest } = e as any;
    try {
      return JSON.stringify({ name, message, stack, ...rest });
    } catch {
      return `${name}: ${message}`;
    }
  }
  try { return JSON.stringify(e); } catch { return String(e); }
}