import { getTranslations, setRequestLocale } from "next-intl/server";
import { verifyEmailAction } from "./actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;
  const t = await getTranslations("auth");

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("verifyEmail.error")}</CardTitle>
            <CardDescription>{t("verifyEmail.noToken")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login" className="text-primary hover:underline">
              {t("backToLogin")}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = await verifyEmailAction(token);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {result.success ? t("verifyEmail.success") : t("verifyEmail.error")}
          </CardTitle>
          <CardDescription>
            {result.success ? t("verifyEmail.successMessage") : result.error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-primary hover:underline">
            {t("verifyEmail.proceedToLogin")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
