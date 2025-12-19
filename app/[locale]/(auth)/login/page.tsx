import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = useTranslations("auth.login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">{t("title")}</h2>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <LoginForm locale={locale} />
          <div className="mt-4 text-center text-sm">
            <Link
              href={`/${locale}/reset-password`}
              className="text-gray-600 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">{t("noAccount")} </span>
            <Link
              href={`/${locale}/register`}
              className="font-medium text-gray-900 hover:underline"
            >
              {t("signUp")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
