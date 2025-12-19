import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/rbac";
import { sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  // Require admin role
  await requireAdmin();

  const t = await getTranslations("admin");

  // Get stats
  const [stats] = await db
    .select({
      totalUsers: sql<number>`count(*)::int`,
      verifiedUsers: sql<number>`count(*) filter (where ${users.emailVerified} is not null)::int`,
      adminUsers: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
    })
    .from(users);

  // Get recent users
  const recentUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} desc`)
    .limit(10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("stats.totalUsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("stats.verifiedUsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.verifiedUsers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("stats.admins")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.adminUsers || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentUsers.title")}</CardTitle>
          <CardDescription>{t("recentUsers.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      user.role === "admin"
                        ? "bg-destructive/10 text-destructive dark:bg-destructive/20"
                        : user.role === "moderator"
                          ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.role}
                  </span>
                  {user.emailVerified && (
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
