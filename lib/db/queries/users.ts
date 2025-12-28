import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { accounts, profiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

/**
 * DAL: Get current authenticated user
 * Uses auth() to ensure user is authenticated
 */
export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  return user || null;
});

/**
 * DAL: Get user profile with authentication check
 * Only returns profile if user is authenticated
 */
export const getCurrentUserProfile = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  return profile || null;
});

/**
 * DAL: Get user by ID (admin only)
 * TODO: Add role-based access control
 */
export const getUserById = cache(async (userId: string) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // TODO: Add admin role check
  // if (!session.user.role === 'admin') throw new Error('Forbidden');

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  return user || null;
});

/**
 * DAL: Update current user profile
 * Only allows users to update their own profile
 */
export const updateCurrentUserProfile = async (data: {
  name?: string;
  bio?: string;
  locale?: string;
  theme?: string;
}) => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Update user name if provided
  if (data.name) {
    await db.update(users).set({ name: data.name }).where(eq(users.id, session.user.id));
  }

  // Update or create profile
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (existingProfile) {
    await db
      .update(profiles)
      .set({
        bio: data.bio,
        locale: data.locale,
        theme: data.theme,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, session.user.id));
  } else {
    await db.insert(profiles).values({
      userId: session.user.id,
      bio: data.bio,
      locale: data.locale,
      theme: data.theme,
    });
  }

  return true;
};

/**
 * DAL: Export all user data (GDPR compliance)
 * Returns comprehensive user data including profile and connected accounts
 */
export const exportUserData = async () => {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Get user data
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) throw new Error("User not found");

  // Get profile data
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

  // Get connected accounts (OAuth providers)
  const connectedAccounts = await db
    .select({
      provider: accounts.provider,
      type: accounts.type,
      createdAt: accounts.id, // We don't expose sensitive tokens
    })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  // Sanitize data - remove sensitive fields
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    // Exclude: password, twoFactorSecret, twoFactorBackupCodes
  };

  const exportData = {
    user: sanitizedUser,
    profile: profile || null,
    connectedAccounts: connectedAccounts.map((acc) => ({
      provider: acc.provider,
      type: acc.type,
    })),
    exportDate: new Date().toISOString(),
    dataRetentionNotice:
      "This export contains all personal data we store about you. You have the right to request deletion of this data at any time.",
  };

  return exportData;
};
