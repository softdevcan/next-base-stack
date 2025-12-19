"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { disable2FAAction } from "./actions";

export function Disable2FAForm() {
  const t = useTranslations("account.twoFactor");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("token", token);

    const result = await disable2FAAction(formData);

    if (result.success) {
      window.location.reload();
    } else {
      setError(result.error || "Failed to disable 2FA");
    }
  };

  if (!showConfirm) {
    return (
      <Button variant="destructive" onClick={() => setShowConfirm(true)}>
        {t("disable")}
      </Button>
    );
  }

  return (
    <form onSubmit={handleDisable} className="space-y-4">
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{t("disableWarning")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="token">{t("verificationCode")}</Label>
        <Input
          id="token"
          type="text"
          placeholder="000000"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          maxLength={6}
          pattern="[0-9]{6}"
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="destructive">
          {t("confirmDisable")}
        </Button>
        <Button type="button" variant="outline" onClick={() => setShowConfirm(false)}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
