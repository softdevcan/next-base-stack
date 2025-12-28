"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createPortalSession } from "./actions";

export function ManageBillingButton() {
  const t = useTranslations("billing");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    startTransition(async () => {
      try {
        const result = await createPortalSession({
          returnUrl: `${window.location.origin}/billing`,
        });

        if (result.error) {
          toast.error(result.error);
          setIsLoading(false);
          return;
        }

        if (result.url) {
          window.location.href = result.url;
        }
      } catch (error) {
        console.error("Error creating portal session:", error);
        toast.error("Something went wrong. Please try again.");
        setIsLoading(false);
      }
    });
  };

  return (
    <Button onClick={handleClick} disabled={isLoading || isPending}>
      {isLoading || isPending ? "Loading..." : t("actions.managePortal")}
    </Button>
  );
}
