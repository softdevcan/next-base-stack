import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { cache } from "react";

/**
 * DAL: Get activity logs for current user
 * Returns the most recent activity logs
 */
export const getCurrentUserActivityLogs = cache(async (limit = 50) => {
  const session = await auth();
  if (!session?.user?.id) return [];

  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, session.user.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

  return logs;
});

/**
 * DAL: Get recent login activity for current user
 */
export const getRecentLogins = cache(async (limit = 10) => {
  const session = await auth();
  if (!session?.user?.id) return [];

  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, session.user.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);

  return logs.filter((log) => log.action === "login");
});
