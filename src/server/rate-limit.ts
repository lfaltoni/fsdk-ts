/**
 * In-memory sliding window rate limiter for Next.js API routes.
 *
 * Usage:
 *   import { createRateLimiter } from 'fsdk-ts/server'
 *
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 3 })
 *
 *   export async function POST(request: NextRequest) {
 *     const ip = getClientIp(request)
 *     const { limited } = limiter.check(ip)
 *     if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 *     // ...
 *   }
 *
 * Storage:
 *   In-memory Map — counters reset on restart, per-instance only.
 *   Fine for single-process dev and low-traffic routes. For shared state
 *   across workers/serverless functions, swap to a Redis-backed store.
 */

export interface RateLimitOptions {
  /** Time window in milliseconds. Default: 60000 (1 minute). */
  windowMs?: number
  /** Max requests per window per key. Default: 5. */
  max?: number
}

export interface RateLimitResult {
  /** Whether the request should be blocked. */
  limited: boolean
  /** Requests remaining in the current window. */
  remaining: number
  /** Seconds until the oldest request in the window expires (0 if not limited). */
  retryAfter: number
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000
  const max = options.max ?? 5
  const store = new Map<string, number[]>()

  // Periodically clean up stale entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const cutoff = Date.now() - windowMs * 2
    for (const [key, timestamps] of store) {
      const fresh = timestamps.filter((t) => t > cutoff)
      if (fresh.length === 0) {
        store.delete(key)
      } else {
        store.set(key, fresh)
      }
    }
  }, windowMs)

  // Allow Node.js to exit even if the interval is running
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now()
      const windowStart = now - windowMs

      // Get existing timestamps, prune expired ones
      const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart)

      if (timestamps.length >= max) {
        const oldestInWindow = timestamps[0]
        const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000)
        store.set(key, timestamps)
        return { limited: true, remaining: 0, retryAfter }
      }

      // Record this request
      timestamps.push(now)
      store.set(key, timestamps)

      return {
        limited: false,
        remaining: max - timestamps.length,
        retryAfter: 0,
      }
    },
  }
}

/**
 * Extract the client IP from a Next.js request.
 * Checks X-Forwarded-For → X-Real-IP → falls back to 'unknown'.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}
