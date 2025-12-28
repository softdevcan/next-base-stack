import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SUBSCRIPTION_PLANS, formatCurrency } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { getUserSubscription } from "@/lib/db/queries";
import { PricingToggle } from "./pricing-toggle";
import { SubscribeButton } from "./subscribe-button";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "pricing" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function PricingPage() {
  const session = await auth();
  const subscription = session?.user?.id ? await getUserSubscription() : null;

  return (
    <div className="container mx-auto px-4 py-16">
      <PricingHeader />
      <PricingToggle subscription={subscription} />
    </div>
  );
}

function PricingHeader() {
  const t = useTranslations("pricing");

  return (
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold tracking-tight mb-4">{t("title")}</h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
    </div>
  );
}
