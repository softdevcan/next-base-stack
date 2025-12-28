import { useTranslations } from "next-intl";
import Link from "next/link";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { key: "features", href: `/${locale}/#features` },
      { key: "pricing", href: `/${locale}/#pricing` },
      { key: "documentation", href: `/${locale}/docs` },
    ],
    company: [
      { key: "about", href: `/${locale}/about` },
      { key: "contact", href: `/${locale}/contact` },
      { key: "blog", href: `/${locale}/blog` },
    ],
    legal: [
      { key: "privacy", href: `/${locale}/privacy` },
      { key: "terms", href: `/${locale}/terms` },
      { key: "cookies", href: `/${locale}/cookies` },
    ],
    social: [
      { key: "github", href: "https://github.com", icon: "🔗" },
      { key: "twitter", href: "https://twitter.com", icon: "🐦" },
      { key: "linkedin", href: "https://linkedin.com", icon: "💼" },
    ],
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{t("brandName")}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t("brandDescription")}</p>
            <div className="mt-6 flex space-x-4">
              {footerLinks.social.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={t(`social.${link.key}`)}
                >
                  <span className="text-xl">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("sections.product")}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("sections.company")}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">{t("sections.legal")}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {t(`links.${link.key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {t("brandName")}. {t("copyright")}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{t("madeWith")} ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
