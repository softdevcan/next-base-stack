import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { profiles, users } from "@/lib/db/schema";
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
