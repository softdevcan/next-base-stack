"use server";

import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "node:crypto";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordResetAction(formData: FormData) {
  const validatedFields = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid email address" };
  }

  const { email } = validatedFields.data;

  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Don't reveal if user exists or not (security best practice)
  if (!user) {
    return { success: true, message: "If an account exists, a reset link has been sent." };
  }

  // Generate reset token
  const resetToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  // Store token in database
  await db.insert(verificationTokens).values({
    identifier: email,
    token: resetToken,
    type: "password_reset",
    expires,
  });

  // Send email with reset link
  const { sendPasswordResetEmail } = await import("@/lib/mail");
  await sendPasswordResetEmail(email, resetToken);

  return { success: true, message: "If an account exists, a reset link has been sent." };
}

const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function resetPasswordAction(formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { token, password } = validatedFields.data;

  // Find valid token
  const [resetToken] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "Invalid or expired reset token" };
  }

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, resetToken.identifier))
    .limit(1);

  if (!user) {
    return { error: "User not found" };
  }

  // Hash new password
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update password
  await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));

  // Delete used token
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

  return { success: true };
}
