import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Stripe Client
 * Official Stripe SDK client for server-side operations
 * Only initialized if STRIPE_SECRET_KEY is provided
 */
export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

/**
 * Subscription Plan Configuration (Client-Safe)
 * Defines available subscription tiers and their features
 * Note: stripePriceId values are retrieved server-side for security
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    currency: "usd",
    features: [
      "Basic features",
      "Community support",
      "5 projects limit",
      "1 GB storage",
    ],
    stripePriceId: null, // Free tier has no Stripe subscription
  },
  pro: {
    name: "Pro",
    description: "Perfect for professionals and small teams",
    monthly: {
      price: 9.99,
      currency: "usd",
    },
    yearly: {
      price: 99.99, // ~$8.33/month (17% savings)
      currency: "usd",
    },
    features: [
      "All Free features",
      "Unlimited projects",
      "10 GB storage",
      "Priority email support",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  enterprise: {
    name: "Enterprise",
    description: "For large teams and organizations",
    monthly: {
      price: 29.99,
      currency: "usd",
    },
    yearly: {
      price: 299.99, // ~$25/month (17% savings)
      currency: "usd",
    },
    features: [
      "All Pro features",
      "Unlimited storage",
      "24/7 phone & email support",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security features",
    ],
  },
} as const;

/**
 * Get Stripe Price ID for a plan (Server-Side Only)
 * This function should only be called from server components or server actions
 */
export function getStripePriceId(plan: "pro" | "enterprise", interval: "monthly" | "yearly"): string {
  if (plan === "pro") {
    return interval === "monthly"
      ? env.STRIPE_PRO_MONTHLY_PRICE_ID || ""
      : env.STRIPE_PRO_YEARLY_PRICE_ID || "";
  }
  return interval === "monthly"
    ? env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || ""
    : env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "";
}

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Helper function to format currency
 */
export function formatCurrency(amount: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Helper function to get plan name from Stripe Price ID
 */
export function getPlanFromPriceId(priceId: string): {
  plan: SubscriptionPlan;
  interval: "monthly" | "yearly";
} | null {
  if (priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID) {
    return { plan: "pro", interval: "monthly" };
  }
  if (priceId === env.STRIPE_PRO_YEARLY_PRICE_ID) {
    return { plan: "pro", interval: "yearly" };
  }
  if (priceId === env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID) {
    return { plan: "enterprise", interval: "monthly" };
  }
  if (priceId === env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID) {
    return { plan: "enterprise", interval: "yearly" };
  }
  return null;
}

/**
 * Helper function to check if a subscription is active
 */
export function isSubscriptionActive(status: string): boolean {
  return ["active", "trialing"].includes(status);
}

/**
 * Helper to check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!env.STRIPE_SECRET_KEY;
}
