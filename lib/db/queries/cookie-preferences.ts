/**
 * Cookie Preferences DAL (Data Access Layer)
 * All cookie preference database queries with auth checks
 */

import "server-only";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import type { CookiePreferences } from "@/lib/cookie-consent";
import { eq } from "drizzle-orm";
import { cache } from "react";

/**
 * Get current user's cookie preferences from database
 * Only for authenticated users
 */
export const getUserCookiePreferences = cache(async (): Promise<CookiePreferences | null> => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [profile] = await db
    .select({
      necessary: profiles.cookieNecessary,
      functional: profiles.cookieFunctional,
      analytics: profiles.cookieAnalytics,
      marketing: profiles.cookieMarketing,
    })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (!profile) {
    return null;
  }

  return {
    necessary: profile.necessary,
    functional: profile.functional,
    analytics: profile.analytics,
    marketing: profile.marketing,
  };
});

/**
 * Check if current user has given cookie consent
 */
export const hasGivenCookieConsent = cache(async (): Promise<boolean> => {
  const session = await auth();

  if (!session?.user?.id) {
    return false;
  }

  const [profile] = await db
    .select({
      consentGiven: profiles.cookieConsentGiven,
    })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  return profile?.consentGiven ?? false;
});

/**
 * Update current user's cookie preferences
 */
export async function updateUserCookiePreferences(
  preferences: CookiePreferences
): Promise<void> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(profiles)
    .set({
      cookieConsentGiven: true,
      cookieConsentDate: new Date(),
      cookieNecessary: preferences.necessary,
      cookieFunctional: preferences.functional,
      cookieAnalytics: preferences.analytics,
      cookieMarketing: preferences.marketing,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, session.user.id));
}
