import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserActivityLogs } from "@/lib/db/queries";
import { Calendar, Globe, Monitor } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { formatDistanceToNow } from "date-fns";
import { enUS, tr } from "date-fns/locale";

const actionIcons: Record<string, string> = {
  login: "🔑",
  logout: "👋",
  register: "📝",
  password_changed: "🔐",
  "2fa_enabled": "🛡️",
  "2fa_disabled": "⚠️",
  profile_updated: "✏️",
  email_verified: "✅",
  account_deleted: "🗑️",
  data_exported: "📦",
};

export default async function ActivityLogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("activityLog");
  const dateLocale = locale === "tr" ? tr : enUS;

  const activities = await getCurrentUserActivityLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity")}</CardTitle>
          <CardDescription>{t("recentActivityDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("noActivity")}</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="text-2xl">{actionIcons[activity.action] || "📋"}</div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{activity.description}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(activity.createdAt), {
                            addSuffix: true,
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                      {activity.ipAddress && (
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{activity.ipAddress}</span>
                        </div>
                      )}
                      {activity.userAgent && (
                        <div className="flex items-center gap-1">
                          <Monitor className="h-3 w-3" />
                          <span className="truncate max-w-xs">{activity.userAgent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
