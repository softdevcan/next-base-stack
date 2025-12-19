import { getCurrentUser, getCurrentUserProfile } from "@/lib/db/queries";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  const user = await getCurrentUser();
  const profile = await getCurrentUserProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Personal Information */}
      <ProfileForm user={user} profile={profile} />
    </div>
  );
}
