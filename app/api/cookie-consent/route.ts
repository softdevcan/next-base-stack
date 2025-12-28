/**
 * Cookie Consent API Route
 * Handles saving cookie preferences for both authenticated and non-authenticated users
 */

import { auth } from "@/auth";
import { setCookiePreferences } from "@/lib/cookie-consent";
import type { CookiePreferences } from "@/lib/cookie-consent";
import { updateUserCookiePreferences } from "@/lib/db/queries/cookie-preferences";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the preferences
    const preferences: CookiePreferences = {
      necessary: body.necessary === true, // Always true
      functional: body.functional === true,
      analytics: body.analytics === true,
      marketing: body.marketing === true,
    };

    // Get session to check if user is authenticated
    const session = await auth();

    if (session?.user?.id) {
      // Authenticated user: Save to database
      await updateUserCookiePreferences(preferences);
    }

    // Save to browser cookie (for both authenticated and non-authenticated users)
    await setCookiePreferences(preferences);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving cookie preferences:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
