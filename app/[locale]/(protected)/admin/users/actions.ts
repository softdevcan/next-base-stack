"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requirePermission } from "@/lib/rbac";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["user", "admin", "moderator"]),
});

export async function updateUserRoleAction(formData: FormData) {
  // Check permission
  await requirePermission("users:write");

  const validatedFields = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input" };
  }

  const { userId, role } = validatedFields.data;

  // Update user role
  await db.update(users).set({ role }).where(eq(users.id, userId));

  return { success: true };
}
