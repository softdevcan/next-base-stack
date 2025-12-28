import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ExportForm } from "./export-form";

export default async function DataExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("dataExportPage");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <ExportForm />
    </div>
  );
}
