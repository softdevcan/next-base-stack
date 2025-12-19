import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// UUIDv7 function for PostgreSQL
// Note: This requires PostgreSQL 18+ or a custom function
// For now, we'll use gen_random_uuid() and document UUIDv7 requirement

/**
 * Users table - Core user information
 * Primary Key: UUIDv7 (requires PostgreSQL 18+ or custom function)
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed password for credentials login
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  role: text("role").default("user").notNull(), // "user", "admin", "moderator"
  twoFactorEnabled: text("two_factor_enabled").default("false"), // "false", "totp", "sms"
  twoFactorSecret: text("two_factor_secret"), // TOTP secret (encrypted)
  twoFactorBackupCodes: text("two_factor_backup_codes"), // JSON array of backup codes (hashed)
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Accounts table - OAuth provider accounts
 * Links users to external authentication providers
 */
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

/**
 * Sessions table - Active user sessions
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Verification Tokens table - Email verification and password reset tokens
 */
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // 'email_verification' or 'password_reset'
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * User Profiles table - Extended user information
 * Separated from users table for better organization
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  locale: text("locale").default("tr"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
