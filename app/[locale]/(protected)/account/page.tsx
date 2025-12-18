import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = useTranslations("account");

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("subtitle")}</p>
      </div>

      <div className="space-y-6">
        {/* Password Section */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">{t("password.title")}</h2>
          <p className="text-sm text-gray-600">
            Password management functionality will be implemented here.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-semibold text-red-600">{t("danger.title")}</h2>
          <p className="mb-4 text-sm text-gray-600">{t("danger.deleteWarning")}</p>
          <Button variant="destructive">{t("danger.deleteAccount")}</Button>
        </div>
      </div>
    </div>
  );
}
