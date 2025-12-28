"use server";

import { auth } from "@/auth";
import { logActivity } from "@/lib/activity-log";
import { exportUserData } from "@/lib/db/queries";

export type ExportFormat = "json" | "csv";

/**
 * Server Action: Export user data in specified format
 * Returns the data as a string for download
 */
export async function exportData(format: ExportFormat) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const data = await exportUserData();

    // Log the export activity
    await logActivity({
      userId: session.user.id,
      action: "data_exported",
      description: `Exported account data in ${format.toUpperCase()} format`,
      metadata: { format },
    });

    if (format === "json") {
      return {
        success: true,
        data: JSON.stringify(data, null, 2),
        filename: `user-data-export-${new Date().toISOString().split("T")[0]}.json`,
        mimeType: "application/json",
      };
    }

    if (format === "csv") {
      // Convert to CSV format
      const csv = convertToCSV(data);
      return {
        success: true,
        data: csv,
        filename: `user-data-export-${new Date().toISOString().split("T")[0]}.csv`,
        mimeType: "text/csv",
      };
    }

    return { success: false, error: "Invalid format" };
  } catch (error) {
    console.error("Export data error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to export data",
    };
  }
}

/**
 * Convert user data to CSV format
 */
function convertToCSV(data: any): string {
  const lines: string[] = [];

  // User Information Section
  lines.push("USER INFORMATION");
  lines.push("Field,Value");
  lines.push(`ID,${data.user.id}`);
  lines.push(`Name,${data.user.name || ""}`);
  lines.push(`Email,${data.user.email}`);
  lines.push(`Email Verified,${data.user.emailVerified || "No"}`);
  lines.push(`Role,${data.user.role}`);
  lines.push(`Two-Factor Enabled,${data.user.twoFactorEnabled}`);
  lines.push(`Account Created,${data.user.createdAt}`);
  lines.push(`Last Updated,${data.user.updatedAt}`);
  lines.push("");

  // Profile Information Section
  if (data.profile) {
    lines.push("PROFILE INFORMATION");
    lines.push("Field,Value");
    lines.push(`Bio,${data.profile.bio || ""}`);
    lines.push(`Locale,${data.profile.locale}`);
    lines.push(`Theme,${data.profile.theme}`);
    lines.push(`Email Notification - Password Changed,${data.profile.emailNotificationPasswordChanged}`);
    lines.push(`Email Notification - 2FA Enabled,${data.profile.emailNotification2faEnabled}`);
    lines.push(`Email Notification - 2FA Disabled,${data.profile.emailNotification2faDisabled}`);
    lines.push(
      `Email Notification - New Device Login,${data.profile.emailNotificationNewDeviceLogin}`,
    );
    lines.push(`Email Notification - Profile Updated,${data.profile.emailNotificationProfileUpdated}`);
    lines.push(
      `Email Notification - Account Deletion,${data.profile.emailNotificationAccountDeletion}`,
    );
    lines.push("");
  }

  // Connected Accounts Section
  if (data.connectedAccounts.length > 0) {
    lines.push("CONNECTED ACCOUNTS");
    lines.push("Provider,Type");
    for (const account of data.connectedAccounts) {
      lines.push(`${account.provider},${account.type}`);
    }
    lines.push("");
  }

  // Export Metadata
  lines.push("EXPORT METADATA");
  lines.push("Field,Value");
  lines.push(`Export Date,${data.exportDate}`);
  lines.push(`Data Retention Notice,"${data.dataRetentionNotice}"`);

  return lines.join("\n");
}
