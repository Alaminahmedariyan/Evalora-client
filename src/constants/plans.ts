export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";

export const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

// Mirrors the backend's PLAN_PRICING (payment.const.ts) — keep these two
// in sync manually, there's no endpoint that exposes pricing.
export const PLAN_PRICE_DISPLAY: Record<SubscriptionPlan, string> = {
  FREE: "$0",
  PRO: "$29",
  ENTERPRISE: "$99",
};

export const PLAN_ORDER: SubscriptionPlan[] = ["FREE", "PRO", "ENTERPRISE"];