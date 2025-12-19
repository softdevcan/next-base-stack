import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Enable2FAForm } from "./enable-2fa-form";
import { Disable2FAForm } from "./disable-2fa-form";

export default async function TwoFactorAuthPage() {
  const session = await auth();
  const t = useTranslations("account.twoFactor");

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get current user's 2FA status
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const is2FAEnabled = user?.twoFactorEnabled === "totp";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("totpTitle")}</CardTitle>
          <CardDescription>{t("totpDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {is2FAEnabled ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  ✓ {t("enabled")}
                </p>
              </div>
              <Disable2FAForm />
            </div>
          ) : (
            <Enable2FAForm userEmail={user?.email || ""} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
