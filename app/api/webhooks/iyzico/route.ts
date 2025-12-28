import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { verifyIyzicoWebhookSignature, getPlanFromIyzicoCode, IYZICO_STATUS_MAP } from "@/lib/iyzico";
import { db } from "@/lib/db";
import { subscriptions, invoices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * iyzico Webhook Handler
 * Handles subscription and payment events from iyzico
 *
 * Webhook events:
 * - subscription.activated - Subscription started
 * - subscription.upgraded - Subscription plan upgraded
 * - subscription.downgraded - Subscription plan downgraded
 * - subscription.canceled - Subscription canceled
 * - subscription.expired - Subscription expired
 * - subscription.payment.success - Recurring payment succeeded
 * - subscription.payment.failed - Recurring payment failed
 */

interface IyzicoWebhookEvent {
  iyziEventType: string;
  iyziEventTime: number;
  iyziReferenceCode: string;
  subscriptionReferenceCode?: string;
  customerReferenceCode?: string;
  pricingPlanReferenceCode?: string;
  subscriptionStatus?: string;
  paymentId?: string;
  price?: number;
  currency?: string;
  paymentStatus?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const headersList = await headers();
    const signature = headersList.get("x-iyz-signature");
    const rawBody = await req.text();

    if (!signature || !env.IYZICO_WEBHOOK_SECRET) {
      console.error("Missing signature or webhook secret");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify signature
    const isValid = verifyIyzicoWebhookSignature(rawBody, signature, env.IYZICO_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook data
    const event: IyzicoWebhookEvent = JSON.parse(rawBody);
    console.log("iyzico webhook event:", event.iyziEventType, event);

    // Handle different event types
    switch (event.iyziEventType) {
      case "subscription.activated":
        await handleSubscriptionActivated(event);
        break;

      case "subscription.upgraded":
      case "subscription.downgraded":
        await handleSubscriptionUpdated(event);
        break;

      case "subscription.canceled":
        await handleSubscriptionCanceled(event);
        break;

      case "subscription.expired":
        await handleSubscriptionExpired(event);
        break;

      case "subscription.payment.success":
        await handlePaymentSuccess(event);
        break;

      case "subscription.payment.failed":
        await handlePaymentFailed(event);
        break;

      default:
        console.log("Unhandled webhook event type:", event.iyziEventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing iyzico webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleSubscriptionActivated(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode || !event.customerReferenceCode) {
    console.error("Missing subscription or customer reference code");
    return;
  }

  // Get plan details from pricing plan reference code
  const planDetails = event.pricingPlanReferenceCode
    ? getPlanFromIyzicoCode(event.pricingPlanReferenceCode)
    : null;

  // Find subscription by customer reference code
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.iyzicoCustomerReferenceCode, event.customerReferenceCode),
  });

  if (!subscription) {
    console.error("Subscription not found for customer:", event.customerReferenceCode);
    return;
  }

  // Update subscription
  await db
    .update(subscriptions)
    .set({
      iyzicoSubscriptionReferenceCode: event.subscriptionReferenceCode,
      status: "active",
      plan: planDetails?.plan || subscription.plan,
      interval: planDetails?.interval || subscription.interval,
      iyzicoCurrentPeriodEnd: new Date(event.iyziEventTime + 30 * 24 * 60 * 60 * 1000), // +30 days
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  console.log("Subscription activated:", event.subscriptionReferenceCode);
}

async function handleSubscriptionUpdated(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode) {
    console.error("Missing subscription reference code");
    return;
  }

  // Get plan details
  const planDetails = event.pricingPlanReferenceCode
    ? getPlanFromIyzicoCode(event.pricingPlanReferenceCode)
    : null;

  // Find and update subscription
  await db
    .update(subscriptions)
    .set({
      plan: planDetails?.plan,
      interval: planDetails?.interval,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.iyzicoSubscriptionReferenceCode, event.subscriptionReferenceCode));

  console.log("Subscription updated:", event.subscriptionReferenceCode);
}

async function handleSubscriptionCanceled(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode) {
    console.error("Missing subscription reference code");
    return;
  }

  // Update subscription to canceled
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.iyzicoSubscriptionReferenceCode, event.subscriptionReferenceCode));

  console.log("Subscription canceled:", event.subscriptionReferenceCode);
}

async function handleSubscriptionExpired(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode) {
    console.error("Missing subscription reference code");
    return;
  }

  // Update subscription to canceled and reset to free plan
  await db
    .update(subscriptions)
    .set({
      status: "canceled",
      plan: "free",
      interval: null,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.iyzicoSubscriptionReferenceCode, event.subscriptionReferenceCode));

  console.log("Subscription expired:", event.subscriptionReferenceCode);
}

async function handlePaymentSuccess(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode || !event.paymentId) {
    console.error("Missing subscription reference or payment ID");
    return;
  }

  // Find subscription
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.iyzicoSubscriptionReferenceCode, event.subscriptionReferenceCode),
  });

  if (!subscription) {
    console.error("Subscription not found:", event.subscriptionReferenceCode);
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: "active",
      iyzicoCurrentPeriodEnd: new Date(event.iyziEventTime + 30 * 24 * 60 * 60 * 1000), // +30 days
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscription.id));

  // Create invoice record
  await db.insert(invoices).values({
    userId: subscription.userId,
    provider: "iyzico",
    iyzicoPaymentId: event.paymentId,
    iyzicoConversationId: event.iyziReferenceCode,
    amount: event.price ? Math.round(event.price * 100) : 0, // Convert to kuruş
    currency: event.currency || "TRY",
    status: "paid",
    periodStart: subscription.iyzicoCurrentPeriodEnd
      ? new Date(subscription.iyzicoCurrentPeriodEnd.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(),
    periodEnd: subscription.iyzicoCurrentPeriodEnd || new Date(),
  });

  console.log("Payment successful:", event.paymentId);
}

async function handlePaymentFailed(event: IyzicoWebhookEvent) {
  if (!event.subscriptionReferenceCode) {
    console.error("Missing subscription reference code");
    return;
  }

  // Update subscription to past_due
  await db
    .update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.iyzicoSubscriptionReferenceCode, event.subscriptionReferenceCode));

  console.log("Payment failed for subscription:", event.subscriptionReferenceCode);
}
