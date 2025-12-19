import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  const session = await auth();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href={`/${locale}`}
          className="text-xl font-bold hover:text-primary transition-colors"
        >
          {t("home")}
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="ghost" size="sm">
                  {t("dashboard")}
                </Button>
              </Link>
              <ThemeToggle />
              <LanguageSwitcher />
              <UserMenu user={session.user} />
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost">{t("login")}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button>{t("register")}</Button>
              </Link>
              <ThemeToggle />
              <LanguageSwitcher />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
