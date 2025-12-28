import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

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
  // Email notification preferences
  emailNotificationPasswordChanged: boolean("email_notification_password_changed")
    .default(true)
    .notNull(),
  emailNotification2faEnabled: boolean("email_notification_2fa_enabled").default(true).notNull(),
  emailNotification2faDisabled: boolean("email_notification_2fa_disabled").default(true).notNull(),
  emailNotificationNewDeviceLogin: boolean("email_notification_new_device_login")
    .default(true)
    .notNull(),
  emailNotificationProfileUpdated: boolean("email_notification_profile_updated")
    .default(false)
    .notNull(),
  emailNotificationAccountDeletion: boolean("email_notification_account_deletion")
    .default(true)
    .notNull(),
  // Cookie preferences (GDPR/CCPA compliance)
  cookieConsentGiven: boolean("cookie_consent_given").default(false).notNull(), // Whether user has responded to cookie banner
  cookieConsentDate: timestamp("cookie_consent_date", { mode: "date" }), // When consent was given
  cookieNecessary: boolean("cookie_necessary").default(true).notNull(), // Required cookies (always true)
  cookieFunctional: boolean("cookie_functional").default(false).notNull(), // Functional/preference cookies
  cookieAnalytics: boolean("cookie_analytics").default(false).notNull(), // Analytics cookies
  cookieMarketing: boolean("cookie_marketing").default(false).notNull(), // Marketing/advertising cookies
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Activity Logs table - Track important account actions
 * Records user activities such as logins, security changes, and account modifications
 */
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // e.g., "login", "password_changed", "2fa_enabled", etc.
  description: text("description").notNull(), // Human-readable description
  ipAddress: text("ip_address"), // IP address of the user
  userAgent: text("user_agent"), // Browser/device info
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Subscriptions table - User subscription information
 * Tracks user subscription status, plan, and Stripe customer ID
 */
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique(), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id").unique(), // Stripe subscription ID
  stripePriceId: text("stripe_price_id"), // Stripe price ID for current plan
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { mode: "date" }), // Current period end date
  plan: text("plan").default("free").notNull(), // "free", "pro", "enterprise"
  status: text("status").default("active").notNull(), // "active", "canceled", "past_due", "incomplete"
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(), // Whether to cancel at period end
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Payment Methods table - User saved payment methods
 * Stores Stripe payment method information
 */
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull().unique(), // Stripe payment method ID
  type: text("type").notNull(), // "card", "sepa_debit", etc.
  last4: text("last4"), // Last 4 digits of card
  brand: text("brand"), // Card brand (visa, mastercard, etc.)
  expiryMonth: integer("expiry_month"), // Card expiry month
  expiryYear: integer("expiry_year"), // Card expiry year
  isDefault: boolean("is_default").default(false).notNull(), // Whether this is the default payment method
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

/**
 * Invoices table - Invoice history
 * Stores Stripe invoice information for user reference
 */
export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeInvoiceId: text("stripe_invoice_id").notNull().unique(), // Stripe invoice ID
  stripeCustomerId: text("stripe_customer_id").notNull(), // Stripe customer ID
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").default("usd").notNull(), // Currency code
  status: text("status").notNull(), // "draft", "open", "paid", "uncollectible", "void"
  invoicePdf: text("invoice_pdf"), // URL to invoice PDF
  hostedInvoiceUrl: text("hosted_invoice_url"), // URL to hosted invoice page
  periodStart: timestamp("period_start", { mode: "date" }), // Billing period start
  periodEnd: timestamp("period_end", { mode: "date" }), // Billing period end
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  activityLogs: many(activityLogs),
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  paymentMethods: many(paymentMethods),
  invoices: many(invoices),
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

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
