import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Globe, Shield, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const values = [
    {
      icon: Zap,
      titleKey: "values.speed.title",
      descKey: "values.speed.description",
    },
    {
      icon: Shield,
      titleKey: "values.security.title",
      descKey: "values.security.description",
    },
    {
      icon: Code2,
      titleKey: "values.quality.title",
      descKey: "values.quality.description",
    },
    {
      icon: Globe,
      titleKey: "values.open.title",
      descKey: "values.open.description",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar locale={locale} />
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("hero.title")}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t("hero.subtitle")}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">{t("story.title")}</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed mb-4">{t("story.paragraph1")}</p>
            <p className="text-muted-foreground leading-relaxed mb-4">{t("story.paragraph2")}</p>
            <p className="text-muted-foreground leading-relaxed">{t("story.paragraph3")}</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">{t("values.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.titleKey}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{t(value.titleKey)}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{t(value.descKey)}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href={`/${locale}/register`}>{t("cta.getStarted")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${locale}/contact`}>{t("cta.contactUs")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
