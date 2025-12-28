import "server-only";

import { eq, desc, sql, and, gte } from "drizzle-orm";
import { cache } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, subscriptions, invoices } from "@/lib/db/schema";

/**
 * Check if current user is admin
 * Throws error if not authenticated or not admin
 */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  if (session.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session.user;
}

/**
 * Get all users with their subscription info
 * Admin-only - includes pagination
 */
export const getAllUsers = cache(async (page = 1, limit = 50) => {
  await requireAdmin();

  const offset = (page - 1) * limit;

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
      plan: subscriptions.plan,
      status: subscriptions.status,
      stripeCustomerId: subscriptions.stripeCustomerId,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  return allUsers;
});

/**
 * Get total user count
 * Admin-only
 */
export const getTotalUserCount = cache(async () => {
  await requireAdmin();

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  return Number(result[0]?.count ?? 0);
});

/**
 * Get subscription statistics
 * Admin-only
 */
export const getSubscriptionStats = cache(async () => {
  await requireAdmin();

  const stats = await db
    .select({
      plan: subscriptions.plan,
      status: subscriptions.status,
      count: sql<number>`count(*)`,
    })
    .from(subscriptions)
    .groupBy(subscriptions.plan, subscriptions.status);

  return stats;
});

/**
 * Get revenue statistics
 * Admin-only - calculates total revenue and MRR
 */
export const getRevenueStats = cache(async () => {
  await requireAdmin();

  // Total revenue from paid invoices
  const totalRevenue = await db
    .select({
      total: sql<number>`sum(${invoices.amount})`,
    })
    .from(invoices)
    .where(eq(invoices.status, "paid"));

  // Monthly recurring revenue (MRR) - revenue from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const mrr = await db
    .select({
      total: sql<number>`sum(${invoices.amount})`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.status, "paid"),
        gte(invoices.createdAt, thirtyDaysAgo)
      )
    );

  // Active subscriptions count
  const activeSubscriptions = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));

  return {
    totalRevenue: Number(totalRevenue[0]?.total ?? 0) / 100, // Convert cents to dollars
    mrr: Number(mrr[0]?.total ?? 0) / 100,
    activeSubscriptions: Number(activeSubscriptions[0]?.count ?? 0),
  };
});

/**
 * Get recent subscriptions
 * Admin-only - shows last N subscriptions
 */
export const getRecentSubscriptions = cache(async (limit = 10) => {
  await requireAdmin();

  const recent = await db
    .select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      userName: users.name,
      userEmail: users.email,
      plan: subscriptions.plan,
      status: subscriptions.status,
      createdAt: subscriptions.createdAt,
      stripeCustomerId: subscriptions.stripeCustomerId,
    })
    .from(subscriptions)
    .leftJoin(users, eq(subscriptions.userId, users.id))
    .orderBy(desc(subscriptions.createdAt))
    .limit(limit);

  return recent;
});

/**
 * Get user by ID (admin view)
 * Admin-only - includes all user data and subscription
 */
export const getUserById = cache(async (userId: string) => {
  await requireAdmin();

  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      subscription: {
        plan: subscriptions.plan,
        status: subscriptions.status,
        stripeCustomerId: subscriptions.stripeCustomerId,
        stripeSubscriptionId: subscriptions.stripeSubscriptionId,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        stripeCurrentPeriodEnd: subscriptions.stripeCurrentPeriodEnd,
      },
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return user[0] || null;
});

/**
 * Update user role
 * Admin-only
 */
export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
  const admin = await requireAdmin();

  // Prevent admin from demoting themselves
  if (admin.id === userId && role !== "admin") {
    throw new Error("Cannot change your own role");
  }

  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { success: true };
}

/**
 * Delete user (admin action)
 * Admin-only - cascades to all related data
 */
export async function deleteUserAsAdmin(userId: string) {
  const admin = await requireAdmin();

  // Prevent admin from deleting themselves
  if (admin.id === userId) {
    throw new Error("Cannot delete your own account");
  }

  await db.delete(users).where(eq(users.id, userId));

  return { success: true };
}
