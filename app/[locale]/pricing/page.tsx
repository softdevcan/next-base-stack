import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { getStripePriceId, isStripeConfigured } from "@/lib/stripe";
import { isIyzicoConfigured } from "@/lib/iyzico-client";
import { auth } from "@/auth";
import { getUserSubscription } from "@/lib/db/queries";
import { PricingToggle } from "./pricing-toggle";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function PricingPage() {
  const session = await auth();
  const subscription = session?.user?.id ? await getUserSubscription() : null;

  // Check which payment providers are configured
  const hasStripe = isStripeConfigured();
  const hasIyzico = isIyzicoConfigured();

  // Get Stripe price IDs server-side (if Stripe is configured)
  const priceIds = hasStripe
    ? {
        proMonthly: getStripePriceId("pro", "monthly"),
        proYearly: getStripePriceId("pro", "yearly"),
        enterpriseMonthly: getStripePriceId("enterprise", "monthly"),
        enterpriseYearly: getStripePriceId("enterprise", "yearly"),
      }
    : {
        proMonthly: "",
        proYearly: "",
        enterpriseMonthly: "",
        enterpriseYearly: "",
      };

  return (
    <div className="container mx-auto px-4 py-16">
      <PricingHeader />
      <PricingToggle
        subscription={subscription}
        priceIds={priceIds}
        hasStripe={hasStripe}
        hasIyzico={hasIyzico}
      />
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
