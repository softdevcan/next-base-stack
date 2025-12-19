import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./lib/i18n/config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for
  // - API routes
  // - _next folder
  // - files with extensions (e.g. favicon.ico)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
