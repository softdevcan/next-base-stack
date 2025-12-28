import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cookies" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function CookiesPage() {
  const t = await getTranslations("cookies");

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("whatAreCookies.title")}</h2>
          <p>{t("whatAreCookies.description")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("howWeUseCookies.title")}</h2>
          <p>{t("howWeUseCookies.description")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("cookieTypes.title")}</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("cookieTypes.necessary.title")}</h3>
            <p>{t("cookieTypes.necessary.description")}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("cookieTypes.functional.title")}</h3>
            <p>{t("cookieTypes.functional.description")}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("cookieTypes.analytics.title")}</h3>
            <p>{t("cookieTypes.analytics.description")}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{t("cookieTypes.marketing.title")}</h3>
            <p>{t("cookieTypes.marketing.description")}</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("manageCookies.title")}</h2>
          <p>{t("manageCookies.description")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
          <p>{t("contact.description")}</p>
        </section>
      </div>
    </div>
  );
}
