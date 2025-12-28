/**
 * Cookie Consent Provider
 * Server component that passes translations to the client-side banner
 */

import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { useTranslations } from "next-intl";

interface CookieConsentProviderProps {
  locale: string;
}

export function CookieConsentProvider({ locale }: CookieConsentProviderProps) {
  const t = useTranslations("cookies.banner");

  const translations = {
    title: t("title"),
    description: t("description"),
    necessary: t("necessary"),
    necessaryDescription: t("necessaryDescription"),
    functional: t("functional"),
    functionalDescription: t("functionalDescription"),
    analytics: t("analytics"),
    analyticsDescription: t("analyticsDescription"),
    marketing: t("marketing"),
    marketingDescription: t("marketingDescription"),
    acceptAll: t("acceptAll"),
    acceptSelected: t("acceptSelected"),
    rejectAll: t("rejectAll"),
    customize: t("customize"),
    privacyPolicy: t("privacyPolicy"),
    close: t("close"),
  };

  return <CookieConsentBanner locale={locale} translations={translations} />;
}
