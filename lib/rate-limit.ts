import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter configuration
 *
 * Uses Upstash Redis if available, otherwise falls back to in-memory Map (development only)
 *
 * Limits:
 * - 5 requests per 10 seconds for auth endpoints (login, register, password reset)
 */

// Check if Upstash Redis is configured
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : undefined;

// Create rate limiter
export const authRateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: true,
      prefix: "@upstash/ratelimit/auth",
    })
  : new Ratelimit({
      // biome-ignore lint/suspicious/noExplicitAny: In-memory Map fallback for development without Redis
      redis: new Map() as any,
      limiter: Ratelimit.slidingWindow(5, "10 s"),
      analytics: false,
      prefix: "@upstash/ratelimit/auth",
    });

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (usually email or IP address)
 * @returns { success: boolean, remaining: number, reset: Date }
 */
export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await authRateLimiter.limit(identifier);

  return {
    success,
    limit,
    remaining,
    reset: new Date(reset),
  };
}

/**
 * Get client IP address from request headers
 * Falls back to 'anonymous' if IP cannot be determined
 */
export function getClientIP(headers: Headers): string {
  // Check common headers for IP address
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  const cfConnectingIP = headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  if (realIP) return realIP;

  return "anonymous";
}
