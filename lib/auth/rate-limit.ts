/**
 * Simple in-memory sliding window rate limiter for authentication endpoints.
 * Protects against credential stuffing and automated brute-force attacks.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of memoryStore.entries()) {
            if (record.resetAt <= now) {
                memoryStore.delete(key);
            }
        }
    }, 60 * 1000);
}

/**
 * Checks and increments rate limit for a key (e.g. `login:192.168.1.1` or `login:user@example.com`).
 * 
 * @param key Unique key to rate limit
 * @param maxAttempts Max allowed attempts within the window
 * @param windowMs Duration of the window in milliseconds
 * @returns { allowed: boolean; remaining: number; retryAfterSeconds: number }
 */
export function checkRateLimit(
    key: string,
    maxAttempts = 5,
    windowMs = 15 * 60 * 1000 // 15 minutes default
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record || record.resetAt <= now) {
        memoryStore.set(key, { count: 1, resetAt: now + windowMs });
        return {
            allowed: true,
            remaining: maxAttempts - 1,
            retryAfterSeconds: Math.ceil(windowMs / 1000),
        };
    }

    if (record.count >= maxAttempts) {
        const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds,
        };
    }

    record.count += 1;
    return {
        allowed: true,
        remaining: maxAttempts - record.count,
        retryAfterSeconds: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
    };
}

/**
 * Resets rate limit for a key upon successful authentication.
 */
export function resetRateLimit(key: string): void {
    memoryStore.delete(key);
}
