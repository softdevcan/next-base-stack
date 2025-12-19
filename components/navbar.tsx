import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export async function Navbar({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  const session = await auth();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="text-xl font-bold">
          {t("home")}
        </Link>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <>
              <Link href={`/${locale}/dashboard`}>
                <Button variant="ghost">{t("dashboard")}</Button>
              </Link>
              <Link href={`/${locale}/profile`}>
                <Button variant="ghost">{t("profile")}</Button>
              </Link>
              <form action="/api/auth/signout" method="POST">
                <Button type="submit" variant="outline">
                  {t("logout")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href={`/${locale}/login`}>
                <Button variant="ghost">{t("login")}</Button>
              </Link>
              <Link href={`/${locale}/register`}>
                <Button>{t("register")}</Button>
              </Link>
            </>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
