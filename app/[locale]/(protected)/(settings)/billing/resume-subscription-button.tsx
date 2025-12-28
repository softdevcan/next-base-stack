"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resumeSubscription } from "./actions";
import { resumeIyzicoSubscription } from "./actions-iyzico";

export function ResumeSubscriptionButton({ provider = "stripe" }: { provider?: "stripe" | "iyzico" }) {
  const t = useTranslations("billing");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleResume = () => {
    startTransition(async () => {
      const result = provider === "iyzico"
        ? await resumeIyzicoSubscription()
        : await resumeSubscription();

      if (result && typeof result === "object" && "error" in result && result.error) {
        toast.error(result.error as string);
        return;
      }

      toast.success(t("resume.success"));
      router.refresh();
    });
  };

  return (
    <Button onClick={handleResume} disabled={isPending} variant="default">
      {isPending ? "Resuming..." : t("actions.resume")}
    </Button>
  );
}
