import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.login");

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Image placeholder */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-muted p-12">
        <div className="text-center space-y-4">
          <div className="w-full h-96 rounded-lg bg-muted-foreground/10 flex items-center justify-center">
            <p className="text-muted-foreground">Image placeholder</p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          </div>
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <LoginForm locale={locale} />
            <div className="mt-4 text-center text-sm">
              <Link
                href={`/${locale}/reset-password`}
                className="text-muted-foreground hover:underline hover:text-foreground transition-colors"
              >
                {t("forgotPassword")}
              </Link>
            </div>
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t("noAccount")} </span>
              <Link href={`/${locale}/register`} className="font-medium hover:underline">
                {t("signUp")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
