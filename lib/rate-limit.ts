interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
let lastCleanup = Date.now();

const WINDOW_MS = 10 * 60 * 1000; // 10-minute window
const MAX_REQUESTS = 5;            // max submissions per window per IP

function evictExpired() {
  const now = Date.now();
  // Only clean up once per minute to avoid O(n) on every request
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

// NOTE: This is an in-memory rate limiter. It works well for low-traffic
// endpoints on single-instance deployments. For multi-instance production
// deployments (Vercel with many serverless instances), upgrade to
// @upstash/ratelimit + Upstash Redis for persistent, distributed limiting.
export function checkRateLimit(identifier: string): RateLimitResult {
  evictExpired();
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}
