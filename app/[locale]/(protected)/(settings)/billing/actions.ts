"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { stripe, SUBSCRIPTION_PLANS } from "@/lib/stripe";
import { env } from "@/lib/env";
import { getUserSubscription, upsertSubscription } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Create Stripe Checkout Session
 * Initiates subscription checkout flow
 */
const checkoutSchema = z.object({
  priceId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function createCheckoutSession(data: z.infer<typeof checkoutSchema>) {
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  const result = checkoutSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid input" };
  }

  try {
    // Get or create Stripe customer
    const subscription = await getUserSubscription();
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await upsertSubscription({
        userId: session.user.id,
        stripeCustomerId: customerId,
        plan: "free",
        status: "active",
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: result.data.priceId,
          quantity: 1,
        },
      ],
      success_url: result.data.successUrl,
      cancel_url: result.data.cancelUrl,
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    return { url: checkoutSession.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { error: "Failed to create checkout session" };
  }
}

/**
 * Create Stripe Customer Portal Session
 * Allows users to manage their subscription
 */
const portalSchema = z.object({
  returnUrl: z.string().url(),
});

export async function createPortalSession(data: z.infer<typeof portalSchema>) {
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = portalSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid input" };
  }

  try {
    const subscription = await getUserSubscription();
    if (!subscription?.stripeCustomerId) {
      return { error: "No Stripe customer found" };
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: result.data.returnUrl,
    });

    return { url: portalSession.url };
  } catch (error) {
    console.error("Error creating portal session:", error);
    return { error: "Failed to create portal session" };
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription() {
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const subscription = await getUserSubscription();
    if (!subscription?.stripeSubscriptionId) {
      return { error: "No active subscription found" };
    }

    // Update subscription to cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription() {
  if (!stripe) {
    return { error: "Stripe is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const subscription = await getUserSubscription();
    if (!subscription?.stripeSubscriptionId) {
      return { error: "No subscription found" };
    }

    // Resume subscription (remove cancel_at_period_end)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, session.user.id));

    return { success: true };
  } catch (error) {
    console.error("Error resuming subscription:", error);
    return { error: "Failed to resume subscription" };
  }
}

/**
 * Get subscription plans with pricing
 */
export async function getSubscriptionPlans() {
  return SUBSCRIPTION_PLANS;
}
