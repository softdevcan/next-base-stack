import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/rbac";
import { sql } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { getRevenueStats, getRecentSubscriptions } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/stripe";
import { formatDistanceToNow } from "date-fns";
import { tr, enUS } from "date-fns/locale";

export default async function AdminDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  // Require admin role
  await requireAdmin();

  const { locale } = await params;
  const t = await getTranslations("admin");

  // Get stats
  const [stats] = await db
    .select({
      totalUsers: sql<number>`count(*)::int`,
      verifiedUsers: sql<number>`count(*) filter (where ${users.emailVerified} is not null)::int`,
      adminUsers: sql<number>`count(*) filter (where ${users.role} = 'admin')::int`,
    })
    .from(users);

  // Get revenue stats
  const revenueStats = await getRevenueStats();

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

  // Get recent subscriptions
  const recentSubscriptions = await getRecentSubscriptions(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.totalUsers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.verifiedUsers || 0} {t("dashboard.stats.verifiedUsers").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.activeSubscriptions")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{revenueStats.activeSubscriptions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.totalRevenue")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(revenueStats.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.stats.mrr")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(revenueStats.mrr)}</p>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentSubscriptions")}</CardTitle>
            <CardDescription>Last 5 subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.noSubscriptions")}</p>
            ) : (
              <div className="space-y-3">
                {recentSubscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{sub.userName || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{sub.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          sub.plan === "enterprise"
                            ? "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20"
                            : sub.plan === "pro"
                              ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {sub.plan}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sub.createdAt && formatDistanceToNow(sub.createdAt, {
                          addSuffix: true,
                          locale: locale === "tr" ? tr : enUS,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentUsers.title")}</CardTitle>
            <CardDescription>{t("dashboard.recentUsers.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{user.name || "No name"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
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
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
