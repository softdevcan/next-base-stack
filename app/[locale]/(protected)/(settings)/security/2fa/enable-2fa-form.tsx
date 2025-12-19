"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { setup2FAAction, verify2FASetupAction } from "./actions";

export function Enable2FAForm({ userEmail }: { userEmail: string }) {
  const t = useTranslations("account.twoFactor");
  const [step, setStep] = useState<"initial" | "scan" | "verify">("initial");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const handleSetup = async () => {
    const result = await setup2FAAction();

    if (result.success && result.qrCode && result.secret) {
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep("scan");
    } else {
      setError(result.error || "Failed to setup 2FA");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("token", token);
    formData.append("secret", secret);

    const result = await verify2FASetupAction(formData);

    if (result.success && result.backupCodes) {
      setBackupCodes(result.backupCodes);
      setStep("verify");
    } else {
      setError(result.error || "Invalid token");
    }
  };

  if (step === "initial") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("setupDescription")}</p>
        <Button onClick={handleSetup}>{t("enable")}</Button>
      </div>
    );
  }

  if (step === "scan") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium">{t("step1")}</h3>
          <p className="text-sm text-muted-foreground">{t("scanQR")}</p>
        </div>

        {qrCode && (
          <div className="flex justify-center">
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
          </div>
        )}

        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">{t("manualEntry")}:</p>
          <code className="text-sm">{secret}</code>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <h3 className="font-medium">{t("step2")}</h3>
            <p className="text-sm text-muted-foreground">{t("enterCode")}</p>
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

          <Button type="submit">{t("verify")}</Button>
        </form>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="font-medium text-green-600 dark:text-green-400">✓ {t("success")}</p>
        </div>

        <div>
          <h3 className="font-medium">{t("backupCodesTitle")}</h3>
          <p className="text-sm text-muted-foreground">{t("backupCodesDescription")}</p>
        </div>

        <div className="rounded-lg bg-muted p-4">
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code) => (
              <code key={code} className="text-sm">
                {code}
              </code>
            ))}
          </div>
        </div>

        <Button onClick={() => window.location.reload()}>{t("done")}</Button>
      </div>
    );
  }

  return null;
}
