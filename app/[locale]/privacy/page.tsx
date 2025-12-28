import { Navbar } from "@/components/navbar";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generatePrivacyPolicy, getFeatureConfig } from "@/lib/privacy-policy-generator";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");

  // Generate privacy policy based on active features
  const privacyPolicy = generatePrivacyPolicy({
    companyName: "Next Base Stack",
    websiteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com",
    contactEmail: "privacy@yourapp.com",
    effectiveDate: "December 21, 2025",
    features: getFeatureConfig(),
  });

  return (
    <>
      <Navbar locale={locale} />
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="mb-8 text-muted-foreground">
          {t("lastUpdated", { date: "December 21, 2025" })}
        </p>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {privacyPolicy.map((section) => (
            <section key={section.title} className="mb-8">
              <h2 className="mb-4 text-2xl font-semibold">{section.title}</h2>
              {section.content.map((paragraph) => {
                // Check if paragraph contains markdown-style bold text
                if (paragraph.includes("**")) {
                  // Split by ** to find bold segments
                  const parts = paragraph.split(/\*\*(.*?)\*\*/g);
                  return (
                    <p key={paragraph.substring(0, 50)} className="mb-3">
                      {parts.map((part, i) => (i % 2 === 1 ? <strong key={part}>{part}</strong> : part))}
                    </p>
                  );
                }
                return (
                  <p key={paragraph.substring(0, 50)} className="mb-3">
                    {paragraph}
                  </p>
                );
              })}
            </section>
          ))}

          <div className="mt-12 rounded-lg border bg-muted/50 p-6">
            <h3 className="mb-2 text-lg font-semibold">Note:</h3>
            <p className="text-sm text-muted-foreground">
              This privacy policy is automatically generated based on the features enabled in this
              application. Please review and customize it according to your specific needs and legal
              requirements. Consult with a legal professional to ensure compliance with applicable
              laws.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
