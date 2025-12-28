import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users, subscriptions } from "@/lib/db/schema";
import { upsertSubscription, upsertPaymentMethod, createInvoice } from "@/lib/db/queries";
import { getPlanFromPriceId } from "@/lib/stripe";

/**
 * Stripe Webhook Handler
 * Handles all Stripe webhook events for subscription management
 *
 * Important events:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - payment_method.attached
 * - payment_method.detached
 */
export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "payment_method.attached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        await handlePaymentMethodAttached(paymentMethod);
        break;
      }

      case "payment_method.detached": {
        const paymentMethod = event.data.object as Stripe.PaymentMethod;
        await handlePaymentMethodDetached(paymentMethod);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

/**
 * Handle subscription creation or update
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  // Get user by Stripe customer ID
  const user = await db.query.users.findFirst({
    with: {
      subscription: true,
    },
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId)),
      ),
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Get plan from price ID
  const planInfo = getPlanFromPriceId(priceId);
  if (!planInfo) {
    console.error("Unknown price ID:", priceId);
    return;
  }

  // Update subscription in database
  const subData = subscription as unknown as {
    id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
  };

  await upsertSubscription({
    userId: user.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subData.id,
    stripePriceId: priceId,
    stripeCurrentPeriodEnd: new Date(subData.current_period_end * 1000),
    plan: planInfo.plan,
    status: subData.status,
    cancelAtPeriodEnd: subData.cancel_at_period_end,
  });

  console.log(`Subscription updated for user ${user.id}: ${planInfo.plan}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  // Get user by Stripe customer ID
  const user = await db.query.users.findFirst({
    with: {
      subscription: true,
    },
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId)),
      ),
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Downgrade to free plan
  await upsertSubscription({
    userId: user.id,
    stripeCustomerId: customerId,
    stripeSubscriptionId: undefined,
    stripePriceId: undefined,
    stripeCurrentPeriodEnd: undefined,
    plan: "free",
    status: "canceled",
    cancelAtPeriodEnd: false,
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Get user by Stripe customer ID
  const user = await db.query.users.findFirst({
    with: {
      subscription: true,
    },
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId)),
      ),
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Create invoice record
  await createInvoice({
    userId: user.id,
    stripeInvoiceId: invoice.id,
    stripeCustomerId: customerId,
    amount: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || "paid",
    invoicePdf: invoice.invoice_pdf || undefined,
    hostedInvoiceUrl: invoice.hosted_invoice_url || undefined,
    periodStart: invoice.period_start
      ? new Date(invoice.period_start * 1000)
      : undefined,
    periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : undefined,
  });

  console.log(`Invoice paid for user ${user.id}: ${invoice.id}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Get user by Stripe customer ID
  const user = await db.query.users.findFirst({
    with: {
      subscription: true,
    },
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId)),
      ),
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Update subscription status
  await db
    .update(subscriptions)
    .set({
      status: "past_due",
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, user.id));

  console.log(`Invoice payment failed for user ${user.id}: ${invoice.id}`);

  // TODO: Send email notification to user about failed payment
}

/**
 * Handle payment method attached
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  if (!paymentMethod.customer) {
    return;
  }

  const customerId = paymentMethod.customer as string;

  // Get user by Stripe customer ID
  const user = await db.query.users.findFirst({
    with: {
      subscription: true,
    },
    where: (users, { exists }) =>
      exists(
        db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId)),
      ),
  });

  if (!user) {
    console.error("User not found for customer:", customerId);
    return;
  }

  // Save payment method
  if (paymentMethod.type === "card" && paymentMethod.card) {
    await upsertPaymentMethod({
      userId: user.id,
      stripePaymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      expiryMonth: paymentMethod.card.exp_month,
      expiryYear: paymentMethod.card.exp_year,
      isDefault: true, // New payment methods are default by default
    });

    console.log(`Payment method attached for user ${user.id}`);
  }
}

/**
 * Handle payment method detached
 */
async function handlePaymentMethodDetached(paymentMethod: Stripe.PaymentMethod) {
  // Delete payment method from database
  await db.delete(subscriptions).where(eq(subscriptions.userId, paymentMethod.id));

  console.log(`Payment method detached: ${paymentMethod.id}`);
}
