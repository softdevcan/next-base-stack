/**
 * Cookie Consent Utilities
 * GDPR/CCPA compliant cookie consent management
 */

import { cookies } from "next/headers";

export type CookieCategory = "necessary" | "functional" | "analytics" | "marketing";

export interface CookiePreferences {
  necessary: boolean; // Always true (required cookies)
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_NAME = "cookie-consent";
const COOKIE_CONSENT_EXPIRY = 365; // days

/**
 * Get cookie preferences from browser cookie
 * This is used for non-authenticated users
 */
export async function getCookiePreferences(): Promise<CookiePreferences | null> {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(COOKIE_CONSENT_NAME);

  if (!consentCookie) {
    return null;
  }

  try {
    return JSON.parse(consentCookie.value) as CookiePreferences;
  } catch {
    return null;
  }
}

/**
 * Set cookie preferences in browser cookie
 * This is used for non-authenticated users
 */
export async function setCookiePreferences(preferences: CookiePreferences): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_CONSENT_NAME, JSON.stringify(preferences), {
    httpOnly: false, // Must be false so client-side JavaScript can read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * COOKIE_CONSENT_EXPIRY, // 365 days
    path: "/",
  });
}

/**
 * Check if a specific cookie category is allowed
 */
export async function isCookieCategoryAllowed(category: CookieCategory): Promise<boolean> {
  const preferences = await getCookiePreferences();

  if (!preferences) {
    // No consent given yet, only necessary cookies allowed
    return category === "necessary";
  }

  return preferences[category];
}

/**
 * Clear all non-necessary cookies if consent is revoked
 */
export async function clearNonNecessaryCookies(): Promise<void> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // List of necessary cookies that should never be cleared
  const necessaryCookies = [
    COOKIE_CONSENT_NAME,
    "csrf-token",
    "authjs.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
    "NEXT_LOCALE",
  ];

  for (const cookie of allCookies) {
    // Skip necessary cookies
    if (necessaryCookies.some((name) => cookie.name.includes(name))) {
      continue;
    }

    // Clear the cookie
    cookieStore.delete(cookie.name);
  }
}

/**
 * Get default cookie preferences (only necessary cookies)
 */
export function getDefaultPreferences(): CookiePreferences {
  return {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  };
}

/**
 * Get all-allowed cookie preferences
 */
export function getAllAllowedPreferences(): CookiePreferences {
  return {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  };
}
