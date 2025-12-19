import { RequestResetForm } from "./request-form";
import { ConfirmResetForm } from "./confirm-form";
import { setRequestLocale } from "next-intl/server";

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { token } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center">
      {token ? <ConfirmResetForm token={token} /> : <RequestResetForm />}
    </div>
  );
}
