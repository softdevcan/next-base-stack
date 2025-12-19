import { auth } from "@/auth";
import { Navbar } from "@/components/navbar";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar locale={locale} />
      {children}
    </div>
  );
}
