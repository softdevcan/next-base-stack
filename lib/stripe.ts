import Stripe from "stripe";
import { env } from "@/lib/env";

/**
 * Stripe Client
 * Official Stripe SDK client for server-side operations
 */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

/**
 * Subscription Plan Configuration
 * Defines available subscription tiers and their features
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
      price: 29,
      currency: "usd",
      stripePriceId: env.STRIPE_PRO_MONTHLY_PRICE_ID,
    },
    yearly: {
      price: 279, // ~$23.25/month (20% discount)
      currency: "usd",
      stripePriceId: env.STRIPE_PRO_YEARLY_PRICE_ID,
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
      price: 99,
      currency: "usd",
      stripePriceId: env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID,
    },
    yearly: {
      price: 949, // ~$79.08/month (20% discount)
      currency: "usd",
      stripePriceId: env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
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

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Helper function to format currency
 */
export function formatCurrency(amount: number, currency: string = "usd"): string {
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
