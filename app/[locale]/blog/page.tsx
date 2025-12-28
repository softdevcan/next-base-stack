import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BlogPage() {
  const t = await getTranslations("blog");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-xl text-muted-foreground">{t("description")}</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{t("comingSoon.title")}</CardTitle>
          <CardDescription>{t("comingSoon.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("comingSoon.message")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
