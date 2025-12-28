"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Database, Settings, Shield, User } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const sidebarItems = [
  {
    key: "profile",
    icon: User,
    translationKey: "profile",
    href: "/profile",
  },
  {
    key: "account",
    icon: Settings,
    translationKey: "account",
    href: "/account",
  },
  {
    key: "security",
    icon: Shield,
    translationKey: "security",
    href: "/security",
  },
  {
    key: "billing",
    icon: CreditCard,
    translationKey: "billing",
    href: "/billing",
  },
  {
    key: "data",
    icon: Database,
    translationKey: "data",
    href: "/data",
  },
] as const;

export function ProfileSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations("nav");

  return (
    <aside className="w-64 space-y-2">
      <div className="pb-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">{t("settings")}</h2>
      </div>
      <nav className="space-y-1">
        {sidebarItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || pathname?.startsWith(`${href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {t(item.translationKey)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
