import { PLAN_ORDER, type SubscriptionPlan } from "@/constants/plans";
import type { SubscriptionPlanInfo } from "@/types";

const isNumberOrNull = (value: unknown): value is number | null =>
  value === null || typeof value === "number";

/**
 * Reads the plan/limits/usage fields the backend adds to the subscription
 * response. Returns null for anything that doesn't match (e.g. the
 * "No active subscription" message), so callers can simply skip the section.
 */
export function readPlanInfo(value: unknown): SubscriptionPlanInfo | null {
  if (typeof value !== "object" || value === null) return null;

  const candidate = value as { effectivePlan?: unknown; limits?: unknown; usage?: unknown };
  const { effectivePlan } = candidate;

  if (typeof effectivePlan !== "string" || !PLAN_ORDER.includes(effectivePlan as SubscriptionPlan)) {
    return null;
  }

  const limits = candidate.limits as
    | { maxAssessments?: unknown; maxInvitationsPer30Days?: unknown }
    | null
    | undefined;
  const usage = candidate.usage as
    | { assessments?: unknown; invitationsLast30Days?: unknown }
    | null
    | undefined;

  if (!limits || !usage) return null;

  const { maxAssessments, maxInvitationsPer30Days } = limits;
  const { assessments, invitationsLast30Days } = usage;

  if (!isNumberOrNull(maxAssessments) || !isNumberOrNull(maxInvitationsPer30Days)) return null;
  if (typeof assessments !== "number" || typeof invitationsLast30Days !== "number") return null;

  return {
    effectivePlan: effectivePlan as SubscriptionPlan,
    limits: { maxAssessments, maxInvitationsPer30Days },
    usage: { assessments, invitationsLast30Days },
  };
}