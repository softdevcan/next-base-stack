import { Navbar } from "@/components/navbar";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

  return (
    <>
      <Navbar locale={locale} />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="mb-8 text-gray-600">{t("lastUpdated", { date: "2025-12-18" })}</p>
        <div className="prose prose-gray max-w-none">
          <p>
            This is a placeholder for your Privacy Policy. You should replace this with your actual
            privacy policy.
          </p>
        </div>
      </div>
    </>
  );
}
