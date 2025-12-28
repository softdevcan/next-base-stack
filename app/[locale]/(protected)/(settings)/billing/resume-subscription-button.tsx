"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resumeSubscription } from "./actions";

export function ResumeSubscriptionButton() {
  const t = useTranslations("billing");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeSubscription();

      if (result.error) {
        toast.error(result.error);
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
