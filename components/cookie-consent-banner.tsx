"use client";

/**
 * Cookie Consent Banner Component
 * GDPR/CCPA compliant cookie consent UI
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Cookie, Settings } from "lucide-react";
import Link from "next/link";

interface CookieConsentBannerProps {
  locale: string;
  translations: {
    title: string;
    description: string;
    necessary: string;
    necessaryDescription: string;
    functional: string;
    functionalDescription: string;
    analytics: string;
    analyticsDescription: string;
    marketing: string;
    marketingDescription: string;
    acceptAll: string;
    acceptSelected: string;
    rejectAll: string;
    customize: string;
    privacyPolicy: string;
    close: string;
  };
}

export function CookieConsentBanner({ locale, translations }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has already been given
    const hasConsent = document.cookie.includes("cookie-consent=");
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };

    await savePreferences(allAccepted);
    setIsVisible(false);
  };

  const handleRejectAll = async () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };

    await savePreferences(onlyNecessary);
    setIsVisible(false);
  };

  const handleAcceptSelected = async () => {
    await savePreferences(preferences);
    setIsVisible(false);
  };

  const savePreferences = async (prefs: typeof preferences) => {
    try {
      const response = await fetch("/api/cookie-consent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving cookie preferences:", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="relative">
          <button
            type="button"
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={translations.close}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Cookie className="h-6 w-6" />
            <CardTitle>{translations.title}</CardTitle>
          </div>
          <CardDescription>{translations.description}</CardDescription>
        </CardHeader>

        <CardContent>
          {showSettings ? (
            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label className="text-base font-medium">{translations.necessary}</Label>
                  <p className="text-sm text-muted-foreground">
                    {translations.necessaryDescription}
                  </p>
                </div>
                <Switch checked={true} disabled aria-label={translations.necessary} />
              </div>

              {/* Functional Cookies */}
              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="functional" className="text-base font-medium">
                    {translations.functional}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translations.functionalDescription}
                  </p>
                </div>
                <Switch
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, functional: checked })
                  }
                  aria-label={translations.functional}
                />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="analytics" className="text-base font-medium">
                    {translations.analytics}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translations.analyticsDescription}
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, analytics: checked })
                  }
                  aria-label={translations.analytics}
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="marketing" className="text-base font-medium">
                    {translations.marketing}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {translations.marketingDescription}
                  </p>
                </div>
                <Switch
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketing: checked })
                  }
                  aria-label={translations.marketing}
                />
              </div>

              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button onClick={handleAcceptSelected} className="flex-1">
                  {translations.acceptSelected}
                </Button>
                <Button onClick={() => setShowSettings(false)} variant="outline" className="flex-1">
                  {translations.close}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <Link href={`/${locale}/privacy`} className="underline hover:text-foreground">
                  {translations.privacyPolicy}
                </Link>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleAcceptAll} className="flex-1">
                  {translations.acceptAll}
                </Button>
                <Button onClick={handleRejectAll} variant="outline" className="flex-1">
                  {translations.rejectAll}
                </Button>
                <Button
                  onClick={() => setShowSettings(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {translations.customize}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
