import "server-only";

import Iyzipay from "iyzipay";
import { env } from "@/lib/env";

/**
 * iyzico Client
 * Official iyzico SDK client for server-side operations
 * Only initialized if IYZICO_API_KEY is provided
 */
export const iyzico = env.IYZICO_API_KEY && env.IYZICO_SECRET_KEY
  ? new Iyzipay({
      apiKey: env.IYZICO_API_KEY,
      secretKey: env.IYZICO_SECRET_KEY,
      uri: env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com",
    })
  : null;

/**
 * Re-export client-safe utilities from iyzico-client
 * These can be safely used in both client and server components
 */
export { IYZICO_SUBSCRIPTION_PLANS, formatTRY, isIyzicoConfigured, type IyzicoSubscriptionPlan } from "./iyzico-client";

/**
 * Get iyzico Plan Code for a plan (Server-Side Only)
 * This function should only be called from server components or server actions
 */
export function getIyzicoPlanCode(plan: "pro" | "enterprise", interval: "monthly" | "yearly"): string {
  if (plan === "pro") {
    return interval === "monthly"
      ? env.IYZICO_PRO_MONTHLY_PLAN_CODE || ""
      : env.IYZICO_PRO_YEARLY_PLAN_CODE || "";
  }
  return interval === "monthly"
    ? env.IYZICO_ENTERPRISE_MONTHLY_PLAN_CODE || ""
    : env.IYZICO_ENTERPRISE_YEARLY_PLAN_CODE || "";
}

/**
 * Helper function to get plan from iyzico Plan Code
 */
export function getPlanFromIyzicoCode(planCode: string): {
  plan: "pro" | "enterprise";
  interval: "monthly" | "yearly";
} | null {
  if (planCode === env.IYZICO_PRO_MONTHLY_PLAN_CODE) {
    return { plan: "pro", interval: "monthly" };
  }
  if (planCode === env.IYZICO_PRO_YEARLY_PLAN_CODE) {
    return { plan: "pro", interval: "yearly" };
  }
  if (planCode === env.IYZICO_ENTERPRISE_MONTHLY_PLAN_CODE) {
    return { plan: "enterprise", interval: "monthly" };
  }
  if (planCode === env.IYZICO_ENTERPRISE_YEARLY_PLAN_CODE) {
    return { plan: "enterprise", interval: "yearly" };
  }
  return null;
}

/**
 * Helper function to verify iyzico webhook signature
 */
export function verifyIyzicoWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require("node:crypto");
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64");

  return signature === expectedSignature;
}

/**
 * iyzico Payment Status Mapping
 */
export const IYZICO_STATUS_MAP = {
  SUCCESS: "active",
  FAILURE: "past_due",
  INIT_THREEDS: "incomplete",
  CALLBACK_THREEDS: "incomplete",
  BKM_POS_SELECTED: "incomplete",
  CALLBACK_PECCO: "incomplete",
} as const;
