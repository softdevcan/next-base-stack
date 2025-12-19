import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac";
import { getTranslations } from "next-intl/server";
import { UpdateRoleForm } from "./update-role-form";

export default async function AdminUsersPage() {
  // Require users:write permission
  await requirePermission("users:write");

  const t = await getTranslations("admin.users");

  // Get all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allUsers")}</CardTitle>
          <CardDescription>{allUsers.length} users total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-1 flex gap-2">
                    {user.emailVerified && (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:bg-green-500/20 dark:text-green-400">
                        ✓ Verified
                      </span>
                    )}
                    {user.twoFactorEnabled === "totp" && (
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        🔒 2FA
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <UpdateRoleForm userId={user.id} currentRole={user.role || "user"} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
