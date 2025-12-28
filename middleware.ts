import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "./lib/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  // CSRF Protection: Verify origin for state-changing requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // If there's an origin header (cross-origin request), verify it
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;

        // Reject if origin doesn't match host
        if (originHost !== host) {
          console.warn(`[CSRF] Blocked request from origin: ${origin} to host: ${host}`);
          return NextResponse.json(
            { error: "Invalid origin" },
            { status: 403 }
          );
        }
      } catch {
        // Invalid origin URL
        return NextResponse.json(
          { error: "Invalid origin" },
          { status: 403 }
        );
      }
    }
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next folder
  // - files with extensions (e.g. favicon.ico)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
