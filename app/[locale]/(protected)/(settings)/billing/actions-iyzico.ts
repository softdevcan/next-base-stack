"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { iyzico, getIyzicoPlanCode, IYZICO_SUBSCRIPTION_PLANS } from "@/lib/iyzico";
import { env } from "@/lib/env";
import { getUserSubscription, upsertSubscription } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Create iyzico Checkout Form
 * Initiates subscription checkout flow with 3D Secure support
 */
const iyzicoCheckoutSchema = z.object({
  plan: z.enum(["pro", "enterprise"]),
  interval: z.enum(["monthly", "yearly"]),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  // Card information
  cardHolderName: z.string().min(2),
  cardNumber: z.string().regex(/^\d{16}$/),
  expireMonth: z.string().regex(/^\d{2}$/),
  expireYear: z.string().regex(/^\d{4}$/),
  cvc: z.string().regex(/^\d{3,4}$/),
  // Buyer information
  buyerName: z.string().min(2),
  buyerSurname: z.string().min(2),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().min(10),
  identityNumber: z.string().min(11).max(11), // Turkish TC Kimlik No
  // Address information
  address: z.string().min(10),
  city: z.string().min(2),
  country: z.string().default("Turkey"),
  zipCode: z.string().optional(),
});

export async function createIyzicoCheckout(data: z.infer<typeof iyzicoCheckoutSchema>) {
  if (!iyzico) {
    return { error: "iyzico is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { error: "Unauthorized" };
  }

  const result = iyzicoCheckoutSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid input" };
  }

  try {
    const { plan, interval, cardHolderName, cardNumber, expireMonth, expireYear, cvc } = result.data;
    const { buyerName, buyerSurname, buyerEmail, buyerPhone, identityNumber } = result.data;
    const { address, city, country, zipCode, successUrl, cancelUrl } = result.data;

    // Get plan details
    const planDetails = IYZICO_SUBSCRIPTION_PLANS[plan];
    const pricing = planDetails[interval];
    if (!pricing) {
      return { error: "Invalid plan or interval" };
    }

    // Get iyzico plan code
    const planCode = getIyzicoPlanCode(plan, interval);
    if (!planCode) {
      return { error: "Plan code not configured" };
    }

    // Get or create customer reference code
    const subscription = await getUserSubscription();
    let customerReferenceCode = subscription?.iyzicoCustomerReferenceCode;

    if (!customerReferenceCode) {
      // Generate unique customer reference code
      customerReferenceCode = `customer_${session.user.id}_${Date.now()}`;

      // Save customer reference code to database
      await upsertSubscription({
        userId: session.user.id,
        provider: "iyzico",
        iyzicoCustomerReferenceCode: customerReferenceCode,
        plan: "free",
        status: "active",
      });
    }

    // Generate unique conversation ID for this payment
    const conversationId = `conv_${session.user.id}_${Date.now()}`;

    // Create subscription initialization request
    const request = {
      locale: "tr",
      conversationId,
      pricingPlanReferenceCode: planCode,
      subscriptionInitialStatus: "ACTIVE",
      customer: {
        name: buyerName,
        surname: buyerSurname,
        identityNumber,
        email: buyerEmail,
        gsmNumber: buyerPhone,
        billingAddress: {
          contactName: `${buyerName} ${buyerSurname}`,
          city,
          country,
          address,
          zipCode: zipCode || "",
        },
        shippingAddress: {
          contactName: `${buyerName} ${buyerSurname}`,
          city,
          country,
          address,
          zipCode: zipCode || "",
        },
      },
      paymentCard: {
        cardHolderName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc,
      },
      subscriptionReferenceCode: `sub_${session.user.id}_${Date.now()}`,
      customerReferenceCode,
      callbackUrl: successUrl, // 3D Secure callback
    };

    // Initialize subscription with iyzico
    return new Promise((resolve, reject) => {
      iyzico.subscription.create(request, (err: any, result: any) => {
        if (err) {
          console.error("iyzico subscription error:", err);
          return resolve({ error: "Failed to create subscription" });
        }

        if (result.status === "success") {
          // Check if 3D Secure is required
          if (result.threeDSHtmlContent) {
            // 3D Secure is required, return HTML content to display
            return resolve({
              requires3DS: true,
              threeDSHtmlContent: result.threeDSHtmlContent,
              conversationId,
            });
          }

          // No 3D Secure required, subscription is created
          // Update database with subscription details
          upsertSubscription({
            userId: session.user.id,
            provider: "iyzico",
            iyzicoSubscriptionReferenceCode: result.subscriptionReferenceCode,
            iyzicoCustomerReferenceCode: customerReferenceCode,
            plan,
            interval,
            status: "active",
          }).catch(console.error);

          return resolve({ success: true, subscriptionReferenceCode: result.subscriptionReferenceCode });
        }

        // Payment failed
        return resolve({ error: result.errorMessage || "Payment failed" });
      });
    });
  } catch (error) {
    console.error("Error creating iyzico checkout:", error);
    return { error: "Failed to create checkout" };
  }
}

/**
 * Handle 3D Secure callback
 * Called after user completes 3D Secure authentication
 */
const threeDSCallbackSchema = z.object({
  conversationId: z.string(),
  paymentId: z.string().optional(),
});

export async function handleIyzico3DSCallback(data: z.infer<typeof threeDSCallbackSchema>) {
  if (!iyzico) {
    return { error: "iyzico is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const result = threeDSCallbackSchema.safeParse(data);
  if (!result.success) {
    return { error: "Invalid callback data" };
  }

  try {
    const { conversationId, paymentId } = result.data;

    // Verify 3D Secure result with iyzico
    const request = {
      locale: "tr",
      conversationId,
      paymentId,
    };

    return new Promise((resolve, reject) => {
      iyzico.subscription.retrieve(request, (err: any, result: any) => {
        if (err) {
          console.error("iyzico 3DS verification error:", err);
          return resolve({ error: "Failed to verify 3D Secure" });
        }

        if (result.status === "success" && result.subscriptionStatus === "ACTIVE") {
          // Subscription is active, update database
          upsertSubscription({
            userId: session.user.id,
            provider: "iyzico",
            iyzicoSubscriptionReferenceCode: result.subscriptionReferenceCode,
            status: "active",
          }).catch(console.error);

          return resolve({ success: true });
        }

        return resolve({ error: result.errorMessage || "3D Secure verification failed" });
      });
    });
  } catch (error) {
    console.error("Error handling 3DS callback:", error);
    return { error: "Failed to process callback" };
  }
}

/**
 * Cancel iyzico subscription
 */
export async function cancelIyzicoSubscription() {
  if (!iyzico) {
    return { error: "iyzico is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const subscription = await getUserSubscription();
    if (!subscription?.iyzicoSubscriptionReferenceCode) {
      return { error: "No active subscription found" };
    }

    // Cancel subscription with iyzico
    const request = {
      locale: "tr",
      subscriptionReferenceCode: subscription.iyzicoSubscriptionReferenceCode,
    };

    return new Promise((resolve, reject) => {
      iyzico.subscription.cancel(request, (err: any, result: any) => {
        if (err) {
          console.error("iyzico cancel error:", err);
          return resolve({ error: "Failed to cancel subscription" });
        }

        if (result.status === "success") {
          // Update database
          db.update(subscriptions)
            .set({
              status: "canceled",
              cancelAtPeriodEnd: true,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, session.user.id))
            .catch(console.error);

          return resolve({ success: true });
        }

        return resolve({ error: result.errorMessage || "Failed to cancel subscription" });
      });
    });
  } catch (error) {
    console.error("Error canceling iyzico subscription:", error);
    return { error: "Failed to cancel subscription" };
  }
}

/**
 * Resume canceled iyzico subscription
 */
export async function resumeIyzicoSubscription() {
  if (!iyzico) {
    return { error: "iyzico is not configured" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const subscription = await getUserSubscription();
    if (!subscription?.iyzicoSubscriptionReferenceCode) {
      return { error: "No subscription found" };
    }

    // Activate subscription with iyzico
    const request = {
      locale: "tr",
      subscriptionReferenceCode: subscription.iyzicoSubscriptionReferenceCode,
    };

    return new Promise((resolve, reject) => {
      iyzico.subscription.activate(request, (err: any, result: any) => {
        if (err) {
          console.error("iyzico activate error:", err);
          return resolve({ error: "Failed to resume subscription" });
        }

        if (result.status === "success") {
          // Update database
          db.update(subscriptions)
            .set({
              status: "active",
              cancelAtPeriodEnd: false,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, session.user.id))
            .catch(console.error);

          return resolve({ success: true });
        }

        return resolve({ error: result.errorMessage || "Failed to resume subscription" });
      });
    });
  } catch (error) {
    console.error("Error resuming iyzico subscription:", error);
    return { error: "Failed to resume subscription" };
  }
}

/**
 * Get iyzico subscription plans with pricing
 */
export async function getIyzicoSubscriptionPlans() {
  return IYZICO_SUBSCRIPTION_PLANS;
}
