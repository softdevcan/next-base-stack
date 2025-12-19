import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth.register");

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

      {/* Right side - Register form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          </div>
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <RegisterForm locale={locale} />
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">{t("hasAccount")} </span>
              <Link href={`/${locale}/login`} className="font-medium hover:underline">
                {t("signIn")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
