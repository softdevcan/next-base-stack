import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  // If user is already logged in, redirect to dashboard
  if (session?.user) {
    redirect(`/${locale}/dashboard`);
  }

  return <>{children}</>;
}
