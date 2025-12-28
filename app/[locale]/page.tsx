import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar locale={locale} />
      {/* Hero Section */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-muted/50 to-background px-4 py-24">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">{t("title")}</h1>
          <p className="mb-8 text-xl text-muted-foreground">{t("subtitle")}</p>
          <button
            type="button"
            className="rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {t("cta")}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-background px-4 py-24">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">{t("features.title")}</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">{t("features.auth.title")}</h3>
              <p className="text-muted-foreground">{t("features.auth.description")}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">{t("features.i18n.title")}</h3>
              <p className="text-muted-foreground">{t("features.i18n.description")}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">{t("features.db.title")}</h3>
              <p className="text-muted-foreground">{t("features.db.description")}</p>
            </div>
            <div className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-xl font-semibold">{t("features.ui.title")}</h3>
              <p className="text-muted-foreground">{t("features.ui.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
