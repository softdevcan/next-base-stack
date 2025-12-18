"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "./actions";
import type { User, Profile } from "@/lib/db/schema";

export function ProfileForm({
  user,
  profile,
  locale,
}: {
  user: User | null;
  profile: Profile | null;
  locale: string;
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
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
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
          name="email"
          type="email"
          defaultValue={user?.email || ""}
          disabled
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          defaultValue={profile?.bio || ""}
          placeholder="Tell us about yourself..."
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "..." : t("save", { ns: "common" })}
      </Button>
    </form>
  );
}
