"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GoogleIcon, GitHubIcon } from "@/components/icons";
import { signIn } from "next-auth/react";
import { registerAction } from "./actions";

export function RegisterForm({ locale }: { locale: string }) {
  const t = useTranslations("auth.register");
  const tErrors = useTranslations("auth.errors");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleOAuthSignIn(provider: "google" | "github") {
    setLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: `/${locale}/dashboard`,
      });
    } catch (error) {
      setError(tErrors("required"));
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await registerAction(formData);

      if (result.error) {
        setError(result.error);
      }
      // Redirect handled in action
    } catch (error) {
      setError(tErrors("required"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="name@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          placeholder="••••••••"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "..." : t("submit")}
      </Button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">{t("orContinueWith")}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading}
        >
          <GoogleIcon className="mr-2 h-4 w-4" />
          {t("continueWithGoogle")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loading}
        >
          <GitHubIcon className="mr-2 h-4 w-4" />
          {t("continueWithGithub")}
        </Button>
      </div>
    </form>
  );
}
