"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/app/[locale]/(protected)/(settings)/billing/actions";

interface SubscribeButtonProps {
  plan: "pro" | "enterprise";
  interval: "monthly" | "yearly";
  currentPlan?: string | null;
  priceId: string;
}

export function SubscribeButton({ plan, interval, currentPlan, priceId }: SubscribeButtonProps) {
  const t = useTranslations("pricing");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await createCheckoutSession({
          priceId,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
        });

        if (result.error) {
          toast.error(result.error);
          setIsLoading(false);
          return;
        }

        if (result.url) {
          // Redirect to Stripe Checkout
          window.location.href = result.url;
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    });
  };

  if (currentPlan === plan) {
    return (
      <Button className="w-full" disabled>
        {t("currentPlan")}
      </Button>
    );
  }

  return (
    <Button className="w-full" onClick={handleSubscribe} disabled={isLoading || isPending}>
      {isLoading || isPending ? "Loading..." : t("choosePlan", { plan: t(`${plan}.name`) })}
    </Button>
  );
}
