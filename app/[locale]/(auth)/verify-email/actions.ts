"use server";

import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function verifyEmailAction(token: string) {
  if (!token) {
    return { success: false, error: "Invalid token" };
  }

  // Find valid token
  const [verificationToken] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.token, token),
        eq(verificationTokens.type, "email_verification")
      )
    )
    .limit(1);

  if (!verificationToken || verificationToken.expires < new Date()) {
    return { success: false, error: "Invalid or expired verification token" };
  }

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, verificationToken.identifier))
    .limit(1);

  if (!user) {
    return { success: false, error: "User not found" };
  }

  // Update user's emailVerified field
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.id, user.id));

  // Delete used token
  await db.delete(verificationTokens).where(eq(verificationTokens.token, token));

  return { success: true };
}

export async function resendVerificationEmailAction(email: string) {
  // Find user
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    // Don't reveal if user exists or not
    return { success: true, message: "If an account exists, a verification email has been sent." };
  }

  // Check if already verified
  if (user.emailVerified) {
    return { success: false, error: "Email is already verified" };
  }

  // Delete old verification tokens for this user
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.type, "email_verification")
      )
    );

  // Generate new verification token
  const { randomBytes } = await import("node:crypto");
  const newToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store new token
  await db.insert(verificationTokens).values({
    identifier: email,
    token: newToken,
    type: "email_verification",
    expires,
  });

  // TODO: Send verification email
  // await sendVerificationEmail(email, newToken);

  return { success: true, message: "Verification email sent successfully" };
}
