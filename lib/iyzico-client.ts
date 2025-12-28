/**
 * iyzico Client-Safe Utilities
 * This file can be safely imported in both client and server components
 * Contains only plan configurations and formatting functions
 */

import { env } from "@/lib/env";

/**
 * Subscription Plan Configuration (Client-Safe)
 * Defines available subscription tiers and their features for iyzico
 * Turkish Lira (TRY) pricing
 */
export const IYZICO_SUBSCRIPTION_PLANS = {
  free: {
    name: "Ücretsiz",
    nameEn: "Free",
    description: "Temel özelliklerle başlayın",
    descriptionEn: "Get started with basic features",
    price: 0,
    currency: "TRY",
    features: [
      "Temel özellikler",
      "Topluluk desteği",
      "5 proje limiti",
      "1 GB depolama",
    ],
    featuresEn: [
      "Basic features",
      "Community support",
      "5 projects limit",
      "1 GB storage",
    ],
    planCode: null, // Free tier has no iyzico subscription
  },
  pro: {
    name: "Pro",
    nameEn: "Pro",
    description: "Profesyoneller ve küçük ekipler için mükemmel",
    descriptionEn: "Perfect for professionals and small teams",
    monthly: {
      price: 349.99, // ~$10-12 USD equivalent
      currency: "TRY",
    },
    yearly: {
      price: 3499.99, // ~$100-120 USD equivalent (17% savings)
      currency: "TRY",
    },
    features: [
      "Tüm Ücretsiz özellikler",
      "Sınırsız proje",
      "10 GB depolama",
      "Öncelikli e-posta desteği",
      "Gelişmiş analitik",
      "Özel markalama",
    ],
    featuresEn: [
      "All Free features",
      "Unlimited projects",
      "10 GB storage",
      "Priority email support",
      "Advanced analytics",
      "Custom branding",
    ],
  },
  enterprise: {
    name: "Kurumsal",
    nameEn: "Enterprise",
    description: "Büyük ekipler ve kuruluşlar için",
    descriptionEn: "For large teams and organizations",
    monthly: {
      price: 999.99, // ~$28-35 USD equivalent
      currency: "TRY",
    },
    yearly: {
      price: 9999.99, // ~$280-350 USD equivalent (17% savings)
      currency: "TRY",
    },
    features: [
      "Tüm Pro özellikler",
      "Sınırsız depolama",
      "7/24 telefon ve e-posta desteği",
      "Özel hesap yöneticisi",
      "Özel entegrasyonlar",
      "SLA garantisi",
      "Gelişmiş güvenlik özellikleri",
    ],
    featuresEn: [
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
 * Helper function to format Turkish Lira currency
 */
export function formatTRY(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Helper to check if iyzico is configured
 */
export function isIyzicoConfigured(): boolean {
  return !!(env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY);
}

export type IyzicoSubscriptionPlan = keyof typeof IYZICO_SUBSCRIPTION_PLANS;
