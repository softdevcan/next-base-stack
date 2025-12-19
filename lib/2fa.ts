import { TOTP, Secret } from "otpauth";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";

/**
 * Generate a new TOTP secret for a user
 */
export function generateTOTPSecret(userEmail: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: "Next Base Stack",
    label: userEmail,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(), // otpauth:// URI for QR code
  };
}

/**
 * Verify a TOTP token
 */
export function verifyTOTPToken(secret: string, token: string): boolean {
  const totp = new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secret),
  });

  // Allow 1 window before and after for clock skew (90 seconds total)
  const delta = totp.validate({ token, window: 1 });

  return delta !== null;
}

/**
 * Generate backup codes for 2FA
 */
export async function generateBackupCodes(count = 10): Promise<{
  plainCodes: string[];
  hashedCodes: string[];
}> {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = randomBytes(4).toString("hex").toUpperCase();
    plainCodes.push(code);

    // Hash the code for storage
    const hashedCode = await bcrypt.hash(code, 10);
    hashedCodes.push(hashedCode);
  }

  return { plainCodes, hashedCodes };
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): Promise<{ valid: boolean; remainingCodes: string[] }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);

    if (isValid) {
      // Remove the used backup code
      const remainingCodes = hashedCodes.filter((_, index) => index !== i);
      return { valid: true, remainingCodes };
    }
  }

  return { valid: false, remainingCodes: hashedCodes };
}
