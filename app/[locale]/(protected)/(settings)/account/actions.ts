"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { currentPassword, newPassword } = result.data;

  try {
    // Get user with current password
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

    if (!user || !user.password) {
      return { error: "User not found or no password set" };
    }

    // Verify current password
    const bcrypt = await import("bcrypt");
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isValidPassword) {
      return { error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/account");

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { error: "Failed to change password" };
  }
}

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required for account deletion"),
  confirmText: z.string().refine((val) => val === "DELETE", {
    message: 'Please type "DELETE" to confirm',
  }),
});

export async function deleteAccountAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = deleteAccountSchema.safeParse({
    password: formData.get("password"),
    confirmText: formData.get("confirmText"),
  });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { password } = result.data;

  try {
    // Get user
    const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

    if (!user) {
      return { error: "User not found" };
    }

    // Verify password (only for users with password - OAuth users don't have password)
    if (user.password) {
      const bcrypt = await import("bcrypt");
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return { error: "Password is incorrect" };
      }
    }

    // Delete related data (cascade delete)
    const { profiles, verificationTokens } = await import("@/lib/db/schema");

    await db.delete(profiles).where(eq(profiles.userId, session.user.id));
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, user.email));

    // Delete user account
    await db.delete(users).where(eq(users.id, session.user.id));

    // Sign out user
    const { signOut } = await import("@/auth");
    await signOut({ redirect: false });

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { error: "Failed to delete account" };
  }
}
