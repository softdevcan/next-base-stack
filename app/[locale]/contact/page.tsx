import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./contact-form";

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  const contactMethods = [
    {
      icon: Mail,
      titleKey: "methods.email.title",
      valueKey: "methods.email.value",
      link: "mailto:hello@example.com",
    },
    {
      icon: Phone,
      titleKey: "methods.phone.title",
      valueKey: "methods.phone.value",
      link: "tel:+1234567890",
    },
    {
      icon: MapPin,
      titleKey: "methods.address.title",
      valueKey: "methods.address.value",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar locale={locale} />
      <div className="flex-1 py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("hero.title")}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("hero.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("form.title")}</CardTitle>
                <CardDescription>{t("form.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("info.title")}</CardTitle>
                <CardDescription>{t("info.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactMethods.map((method) => {
                  const Icon = method.icon;

                  if (method.link) {
                    return (
                      <a
                        key={method.titleKey}
                        href={method.link}
                        className="block hover:bg-accent/50 p-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">{t(method.titleKey)}</h3>
                            <p className="text-sm text-muted-foreground">{t(method.valueKey)}</p>
                          </div>
                        </div>
                      </a>
                    );
                  }

                  return (
                    <div key={method.titleKey} className="p-2">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{t(method.titleKey)}</h3>
                          <p className="text-sm text-muted-foreground">{t(method.valueKey)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* FAQ or Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t("hours.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("hours.weekdays")}</span>
                  <span className="text-sm font-medium">{t("hours.weekdaysTime")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{t("hours.weekend")}</span>
                  <span className="text-sm font-medium">{t("hours.weekendTime")}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </div>

      {/* Footer */}
      <Footer locale={locale} />
    </div>
  );
}
