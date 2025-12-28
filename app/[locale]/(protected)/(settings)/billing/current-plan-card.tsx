import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS, formatCurrency } from "@/lib/stripe";
import type { Subscription } from "@/lib/db/schema";
import Link from "next/link";
import { format } from "date-fns";

export function CurrentPlanCard({ subscription }: { subscription: Subscription | null | undefined }) {
  const t = useTranslations("billing");
  const tPricing = useTranslations("pricing");

  const plan = subscription?.plan || "free";
  const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("plan.current")}</CardTitle>
          <Badge variant={subscription?.status === "active" ? "default" : "secondary"}>
            {subscription?.status === "active"
              ? t("plan.active")
              : subscription?.status === "canceled"
                ? t("plan.canceled")
                : subscription?.status === "past_due"
                  ? t("plan.pastDue")
                  : t("plan.free")}
          </Badge>
        </div>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold">
            {plan === "free"
              ? tPricing("free.name")
              : plan === "pro"
                ? tPricing("pro.name")
                : tPricing("enterprise.name")}
          </h3>
          <p className="text-muted-foreground">
            {plan === "free"
              ? tPricing("free.description")
              : plan === "pro"
                ? tPricing("pro.description")
                : tPricing("enterprise.description")}
          </p>
        </div>

        {subscription?.stripeCurrentPeriodEnd && (
          <div className="text-sm text-muted-foreground">
            {subscription.cancelAtPeriodEnd
              ? t("plan.expiresOn", { date: format(subscription.stripeCurrentPeriodEnd, "PPP") })
              : t("plan.renewsOn", { date: format(subscription.stripeCurrentPeriodEnd, "PPP") })}
          </div>
        )}

        {plan !== "free" && "features" in planConfig && (
          <div>
            <p className="font-medium mb-2">{tPricing("features")}:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {planConfig.features.slice(0, 3).map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      {plan === "free" && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/pricing">{t("actions.upgrade")}</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
