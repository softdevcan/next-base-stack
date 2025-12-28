"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS, formatCurrency } from "@/lib/stripe";
import type { Subscription } from "@/lib/db/schema";
import { SubscribeButton } from "./subscribe-button";

interface PriceIds {
  proMonthly: string;
  proYearly: string;
  enterpriseMonthly: string;
  enterpriseYearly: string;
}

export function PricingToggle({
  subscription,
  priceIds
}: {
  subscription: Subscription | null | undefined;
  priceIds: PriceIds;
}) {
  const t = useTranslations("pricing");
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");

  return (
    <div className="space-y-8">
      {/* Billing Interval Toggle */}
      <div className="flex justify-center items-center gap-4">
        <span
          className={`text-sm font-medium ${interval === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          {t("monthly")}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInterval(interval === "monthly" ? "yearly" : "monthly")}
          className="relative h-8 w-16 rounded-full p-0"
        >
          <span
            className={`absolute inset-y-1 h-6 w-6 rounded-full bg-primary transition-transform ${interval === "yearly" ? "translate-x-9" : "translate-x-1"}`}
          />
        </Button>
        <span
          className={`text-sm font-medium ${interval === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
        >
          {t("yearly")}
        </span>
      </div>

      {interval === "yearly" && (
        <p className="text-center text-sm text-primary font-medium">{t("yearlyDiscount")}</p>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <Card className={subscription?.plan === "free" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-2xl">{t("free.name")}</CardTitle>
            <CardDescription>{t("free.description")}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{formatCurrency(SUBSCRIPTION_PLANS.free.price)}</span>
              <span className="text-muted-foreground">{t("perMonth")}</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {SUBSCRIPTION_PLANS.free.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {subscription?.plan === "free" ? (
              <Button className="w-full" disabled>
                {t("currentPlan")}
              </Button>
            ) : (
              <Button className="w-full" variant="outline" disabled>
                {t("getStarted")}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${subscription?.plan === "pro" ? "border-primary" : "border-primary/50"}`}>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
              {t("popular")}
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">{t("pro.name")}</CardTitle>
            <CardDescription>{t("pro.description")}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {formatCurrency(
                  interval === "monthly"
                    ? SUBSCRIPTION_PLANS.pro.monthly.price
                    : Math.round(SUBSCRIPTION_PLANS.pro.yearly.price / 12),
                )}
              </span>
              <span className="text-muted-foreground">{t("perMonth")}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {interval === "monthly" ? t("billedMonthly") : t("billedYearly")}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {SUBSCRIPTION_PLANS.pro.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <SubscribeButton
              plan="pro"
              interval={interval}
              currentPlan={subscription?.plan}
              priceId={interval === "monthly" ? priceIds.proMonthly : priceIds.proYearly}
            />
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className={subscription?.plan === "enterprise" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="text-2xl">{t("enterprise.name")}</CardTitle>
            <CardDescription>{t("enterprise.description")}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">
                {formatCurrency(
                  interval === "monthly"
                    ? SUBSCRIPTION_PLANS.enterprise.monthly.price
                    : Math.round(SUBSCRIPTION_PLANS.enterprise.yearly.price / 12),
                )}
              </span>
              <span className="text-muted-foreground">{t("perMonth")}</span>
              <p className="text-sm text-muted-foreground mt-1">
                {interval === "monthly" ? t("billedMonthly") : t("billedYearly")}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {SUBSCRIPTION_PLANS.enterprise.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <SubscribeButton
              plan="enterprise"
              interval={interval}
              currentPlan={subscription?.plan}
              priceId={interval === "monthly" ? priceIds.enterpriseMonthly : priceIds.enterpriseYearly}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
