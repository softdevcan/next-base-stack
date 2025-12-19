import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser, getCurrentUserProfile } from "@/lib/db/queries";
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
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <ProfileForm user={user} profile={profile} locale={locale} />
      </div>
    </div>
  );
}
