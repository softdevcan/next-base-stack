import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/navbar";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4 py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            {t("title")}
          </h1>
          <p className="mb-8 text-xl text-gray-600">{t("subtitle")}</p>
          <button type="button" className="rounded-lg bg-gray-900 px-8 py-3 text-lg font-medium text-white transition hover:bg-gray-800">
            {t("cta")}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            {t("features.title")}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {t("features.auth.title")}
              </h3>
              <p className="text-gray-600">{t("features.auth.description")}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {t("features.i18n.title")}
              </h3>
              <p className="text-gray-600">{t("features.i18n.description")}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{t("features.db.title")}</h3>
              <p className="text-gray-600">{t("features.db.description")}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{t("features.ui.title")}</h3>
              <p className="text-gray-600">{t("features.ui.description")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
