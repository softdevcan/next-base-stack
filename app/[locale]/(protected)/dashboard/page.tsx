import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/db/queries";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
        <p className="mt-2 text-gray-600">{t("welcome", { name: user?.name || "User" })}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">{t("stats.users")}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">{t("stats.revenue")}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">$45,678</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">{t("stats.orders")}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">567</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">{t("stats.growth")}</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">+12%</p>
        </div>
      </div>
    </div>
  );
}
