import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * User roles
 */
export type UserRole = "user" | "admin" | "moderator";

/**
 * Permissions mapped to roles
 */
export const PERMISSIONS = {
  // User management
  "users:read": ["admin", "moderator"],
  "users:write": ["admin"],
  "users:delete": ["admin"],

  // Content management
  "content:read": ["user", "admin", "moderator"],
  "content:write": ["admin", "moderator"],
  "content:delete": ["admin", "moderator"],

  // Settings
  "settings:read": ["admin"],
  "settings:write": ["admin"],

  // Reports
  "reports:read": ["admin", "moderator"],
  "reports:write": ["admin"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Get the current user's role
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (user?.role as UserRole) || null;
}

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const role = await getCurrentUserRole();

  if (!role) {
    return false;
  }

  const allowedRoles: readonly UserRole[] = PERMISSIONS[permission];
  return allowedRoles.includes(role);
}

/**
 * Check if the current user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === requiredRole;
}

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if the current user is a moderator
 */
export async function isModerator(): Promise<boolean> {
  return hasRole("moderator");
}

/**
 * Require a specific permission - throws error if not authorized
 */
export async function requirePermission(permission: Permission): Promise<void> {
  const authorized = await hasPermission(permission);

  if (!authorized) {
    throw new Error(`Unauthorized: Missing permission "${permission}"`);
  }
}

/**
 * Require a specific role - throws error if not authorized
 */
export async function requireRole(requiredRole: UserRole): Promise<void> {
  const role = await getCurrentUserRole();

  if (role !== requiredRole) {
    throw new Error(`Unauthorized: Required role "${requiredRole}"`);
  }
}

/**
 * Require admin role - throws error if not authorized
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
}
