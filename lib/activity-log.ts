import "server-only";
import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { headers } from "next/headers";
import { getClientIP } from "./ip";

export type ActivityAction =
  | "login"
  | "logout"
  | "register"
  | "password_changed"
  | "2fa_enabled"
  | "2fa_disabled"
  | "profile_updated"
  | "email_verified"
  | "account_deleted"
  | "data_exported";

/**
 * Log user activity to the database
 */
export async function logActivity(params: {
  userId: string;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, any>;
}) {
  try {
    const headersList = await headers();
    const ipAddress = await getClientIP();
    const userAgent = headersList.get("user-agent") || undefined;

    await db.insert(activityLogs).values({
      userId: params.userId,
      action: params.action,
      description: params.description,
      ipAddress,
      userAgent,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
    });
  } catch (error) {
    // Log the error but don't throw - activity logging shouldn't break the app
    console.error("Failed to log activity:", error);
  }
}
