import type { PlanLimits } from "@/types";

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

// Mirrors PLAN_LIMITS in the backend's utils/planLimits.ts — keep in sync
// manually. Used where no API call is available (the public pricing page).
// null means unlimited.
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: { maxAssessments: 2, maxInvitationsPer30Days: 20 },
  PRO: { maxAssessments: 20, maxInvitationsPer30Days: 200 },
  ENTERPRISE: { maxAssessments: null, maxInvitationsPer30Days: null },
};

export const PLAN_TAGLINE: Record<SubscriptionPlan, string> = {
  FREE: "Try Evalora with a small hiring pipeline.",
  PRO: "For teams that hire regularly.",
  ENTERPRISE: "For high-volume hiring.",
};

// Paid plans are one-time payments that last 30 days (nothing auto-renews).
export const PLAN_PERIOD_LABEL: Record<SubscriptionPlan, string> = {
  FREE: "free forever",
  PRO: "for 30 days",
  ENTERPRISE: "for 30 days",
};

export function formatLimit(value: number | null): string {
  return value === null ? "Unlimited" : String(value);
}

export function planHighlights(plan: SubscriptionPlan): string[] {
  const { maxAssessments, maxInvitationsPer30Days } = PLAN_LIMITS[plan];

  return [
    maxAssessments === null ? "Unlimited assessments" : `Up to ${maxAssessments} assessments`,
    maxInvitationsPer30Days === null
      ? "Unlimited candidate invitations"
      : `Up to ${maxInvitationsPer30Days} candidate invitations per 30 days`,
    "Every feature included",
  ];
}