/**
 * CSRF Protection Utilities
 *
 * Next.js Server Actions have built-in CSRF protection, but this provides
 * additional security layers for critical operations.
 */

import { cookies, headers } from "next/headers";
import { randomBytes } from "crypto";

const CSRF_TOKEN_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_SECRET_NAME = "csrf-secret";

/**
 * Generate a CSRF token
 * Uses the Double Submit Cookie pattern
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();

  // Set the token in a cookie (HttpOnly for security)
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Get the current CSRF token from cookies
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CSRF_TOKEN_NAME);
  return token?.value || null;
}

/**
 * Verify CSRF token from request
 * For Server Actions, this validates the token from headers or FormData
 */
export async function verifyCsrfToken(
  tokenFromRequest: string | null | undefined
): Promise<boolean> {
  if (!tokenFromRequest) {
    return false;
  }

  const cookieStore = await cookies();
  const tokenFromCookie = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  if (!tokenFromCookie) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(tokenFromRequest, tokenFromCookie);
}

/**
 * Verify origin header matches host
 * Protects against CSRF attacks from different origins
 */
export async function verifyOrigin(): Promise<boolean> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const host = headersList.get("host");

  // If no origin header (same-origin requests), allow
  if (!origin) {
    return true;
  }

  // Extract host from origin URL
  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.host;

    // Compare origin host with request host
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware-style CSRF protection for Server Actions
 * Usage: await validateCsrfAction(formData.get("csrf_token") as string);
 */
export async function validateCsrfAction(
  tokenFromRequest: string | null | undefined
): Promise<void> {
  // Verify origin first
  const isValidOrigin = await verifyOrigin();
  if (!isValidOrigin) {
    throw new Error("Invalid origin");
  }

  // For critical operations, also verify CSRF token
  const isValidToken = await verifyCsrfToken(tokenFromRequest);
  if (!isValidToken) {
    throw new Error("Invalid CSRF token");
  }
}

/**
 * Ensure CSRF token exists, create if not
 * Call this in layouts or pages that need CSRF protection
 */
export async function ensureCsrfToken(): Promise<string> {
  let token = await getCsrfToken();

  if (!token) {
    token = await generateCsrfToken();
  }

  return token;
}
