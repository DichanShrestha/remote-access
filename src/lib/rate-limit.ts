/**
 * Simple in-memory rate limiter.
 * Falls back to this when Upstash Redis is not configured.
 * For production, configure Upstash Redis for distributed rate limiting.
 */

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 60 seconds
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (entry.resetAt < now) {
            store.delete(key);
        }
    }
}, 60_000);

export type RateLimitConfig = {
    /** Max requests allowed in the window */
    limit: number;
    /** Window duration in seconds */
    windowSeconds: number;
};

export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

/**
 * Check rate limit for a given identifier (e.g., IP address, user ID).
 */
export function rateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const key = `rl:${identifier}`;
    const entry = store.get(key);

    if (!entry || entry.resetAt < now) {
        // New window
        store.set(key, {
            count: 1,
            resetAt: now + config.windowSeconds * 1000,
        });
        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: now + config.windowSeconds * 1000,
        };
    }

    if (entry.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: entry.resetAt,
        };
    }

    entry.count++;
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - entry.count,
        reset: entry.resetAt,
    };
}

/** Standard rate limit configs */
export const RATE_LIMITS = {
    /** Chat API: 30 requests per minute */
    chat: { limit: 30, windowSeconds: 60 } as RateLimitConfig,
    /** Public chat widget: 20 requests per minute */
    publicChat: { limit: 20, windowSeconds: 60 } as RateLimitConfig,
    /** Training/crawl: 5 requests per minute */
    training: { limit: 5, windowSeconds: 60 } as RateLimitConfig,
    /** Auth: 10 requests per minute */
    auth: { limit: 10, windowSeconds: 60 } as RateLimitConfig,
    /** File upload: 10 per minute */
    upload: { limit: 10, windowSeconds: 60 } as RateLimitConfig,
} as const;
