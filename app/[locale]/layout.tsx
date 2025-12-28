import { locales } from "@/lib/i18n/config";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import "../globals.css";

export const metadata: Metadata = {
  title: "Next Base Stack",
  description: "Full-featured Next.js launchpad with Auth, i18n, and more",
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

import { ThemeProvider } from "@/components/theme-provider";
import { CookieConsentProvider } from "@/components/cookie-consent-provider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster richColors position="top-center" />
            <CookieConsentProvider locale={locale} />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
