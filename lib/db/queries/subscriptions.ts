import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions, paymentMethods, invoices } from "@/lib/db/schema";

/**
 * Get current user's subscription
 * Includes auth check and React cache for deduplication
 */
export const getUserSubscription = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, session.user.id),
  });

  return subscription;
});

/**
 * Get current user's payment methods
 * Includes auth check and React cache for deduplication
 */
export const getUserPaymentMethods = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const methods = await db.query.paymentMethods.findMany({
    where: eq(paymentMethods.userId, session.user.id),
    orderBy: (paymentMethods, { desc }) => [desc(paymentMethods.isDefault)],
  });

  return methods;
});

/**
 * Get current user's invoices
 * Includes auth check and React cache for deduplication
 */
export const getUserInvoices = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userInvoices = await db.query.invoices.findMany({
    where: eq(invoices.userId, session.user.id),
    orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
  });

  return userInvoices;
});

/**
 * Create or update user subscription
 * Internal use only - called from webhook handlers
 */
export async function upsertSubscription(data: {
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  plan: string;
  status: string;
  cancelAtPeriodEnd?: boolean;
}) {
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, data.userId),
  });

  if (existing) {
    // Update existing subscription
    return await db
      .update(subscriptions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, data.userId))
      .returning();
  }

  // Create new subscription
  return await db.insert(subscriptions).values(data).returning();
}

/**
 * Create or update payment method
 * Internal use only - called from webhook handlers
 */
export async function upsertPaymentMethod(data: {
  userId: string;
  stripePaymentMethodId: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}) {
  const existing = await db.query.paymentMethods.findFirst({
    where: eq(paymentMethods.stripePaymentMethodId, data.stripePaymentMethodId),
  });

  if (existing) {
    // Update existing payment method
    return await db
      .update(paymentMethods)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(paymentMethods.stripePaymentMethodId, data.stripePaymentMethodId))
      .returning();
  }

  // Create new payment method
  return await db.insert(paymentMethods).values(data).returning();
}

/**
 * Create invoice record
 * Internal use only - called from webhook handlers
 */
export async function createInvoice(data: {
  userId: string;
  stripeInvoiceId: string;
  stripeCustomerId: string;
  amount: number;
  currency: string;
  status: string;
  invoicePdf?: string;
  hostedInvoiceUrl?: string;
  periodStart?: Date;
  periodEnd?: Date;
}) {
  const existing = await db.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, data.stripeInvoiceId),
  });

  if (existing) {
    // Update existing invoice
    return await db
      .update(invoices)
      .set(data)
      .where(eq(invoices.stripeInvoiceId, data.stripeInvoiceId))
      .returning();
  }

  // Create new invoice
  return await db.insert(invoices).values(data).returning();
}
