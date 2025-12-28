import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Content Security Policy (CSP)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-ancestors 'none'", // Equivalent to X-Frame-Options: DENY
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          // HTTP Strict Transport Security (HSTS)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Clickjacking protection
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // XSS protection (legacy, but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy (disable unnecessary browser features)
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
