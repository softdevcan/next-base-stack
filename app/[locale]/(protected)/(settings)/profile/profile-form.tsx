"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Profile, User } from "@/lib/db/schema";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateProfileAction } from "./actions";

export function ProfileForm({
  user,
  profile,
}: {
  user: User | null;
  profile: Profile | null;
}) {
  const t = useTranslations("profile");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      await updateProfileAction(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Auto-hide after 3s
    } catch (error) {
      // Handle error - could add error state here
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("personalInfo")}</CardTitle>
        <CardDescription>{t("personalInfoDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {success && (
            <div className="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              {t("updateSuccess")}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={user?.name || ""}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">{t("emailReadonly")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile?.bio || ""}
              placeholder={t("bioPlaceholder")}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">{t("bioHint")}</p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("saving") : t("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
