"use server";

import { auth } from "@/auth";
import { generateBackupCodes, generateTOTPSecret, verifyTOTPToken } from "@/lib/2fa";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

export async function setup2FAAction() {
  const session = await auth();

  if (!session?.user?.id || !session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  // Generate TOTP secret
  const { secret, uri } = generateTOTPSecret(session.user.email);

  // Generate QR code
  const qrCode = await QRCode.toDataURL(uri);

  // Store secret temporarily (will be confirmed after verification)
  return {
    success: true,
    secret,
    qrCode,
  };
}

export async function verify2FASetupAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const token = formData.get("token") as string;
  const secret = formData.get("secret") as string;

  if (!token || !secret) {
    return { success: false, error: "Missing token or secret" };
  }

  // Verify the token
  const isValid = verifyTOTPToken(secret, token);

  if (!isValid) {
    return { success: false, error: "Invalid verification code" };
  }

  // Generate backup codes
  const { plainCodes, hashedCodes } = await generateBackupCodes();

  // Enable 2FA for user
  await db
    .update(users)
    .set({
      twoFactorEnabled: "totp",
      twoFactorSecret: secret,
      twoFactorBackupCodes: JSON.stringify(hashedCodes),
    })
    .where(eq(users.id, session.user.id));

  return {
    success: true,
    backupCodes: plainCodes,
  };
}

export async function disable2FAAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const token = formData.get("token") as string;

  if (!token) {
    return { success: false, error: "Missing verification code" };
  }

  // Get user's 2FA secret
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  if (!user?.twoFactorSecret) {
    return { success: false, error: "2FA not enabled" };
  }

  // Verify the token
  const isValid = verifyTOTPToken(user.twoFactorSecret, token);

  if (!isValid) {
    return { success: false, error: "Invalid verification code" };
  }

  // Disable 2FA
  await db
    .update(users)
    .set({
      twoFactorEnabled: "false",
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    })
    .where(eq(users.id, session.user.id));

  return { success: true };
}
