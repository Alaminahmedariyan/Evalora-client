import type { ConsentType } from "@/types";

// Mirrors the backend's CONSENT_TYPE_LABELS (consent.const.ts) — keep in
// sync manually, same as plans.ts.
export const CONSENT_TYPE_LABEL: Record<ConsentType, string> = {
  MARKETING: "Marketing communications",
  ANALYTICS: "Analytics and performance tracking",
  THIRD_PARTY: "Third-party data sharing",
  PRIVACY_POLICY: "Privacy policy",
  TERMS_OF_SERVICE: "Terms of service",
};

// PRIVACY_POLICY / TERMS_OF_SERVICE are acceptance records, not ongoing
// preferences — toggling them off client-side doesn't make sense the way
// it does for MARKETING/ANALYTICS/THIRD_PARTY.
export const REVOCABLE_CONSENT_TYPES: ConsentType[] = ["MARKETING", "ANALYTICS", "THIRD_PARTY"];