import type { ConsentType } from "@/types";

// Mirrors the backend's CONSENT_TYPE_LABELS (consent.const.ts) - keep in
// sync manually, same as plans.ts.
export const CONSENT_TYPE_LABEL: Record<ConsentType, string> = {
  MARKETING: "Marketing communications",
  ANALYTICS: "Analytics and performance tracking",
  THIRD_PARTY: "Third-party data sharing",
  AI_PROCESSING: "AI processing of my assessment answers",
  PRIVACY_POLICY: "Privacy policy",
  TERMS_OF_SERVICE: "Terms of service",
};

// Short explanation shown under a toggle. Only types that need one are listed.
export const CONSENT_TYPE_DESCRIPTION: Partial<Record<ConsentType, string>> = {
  AI_PROCESSING:
    "Lets an AI model suggest a score for your written answers. Only the question, the grading rubric and your answer are sent. Your name, email and phone are never sent. A recruiter always makes the final grade. If you leave this off, your answers are graded by a recruiter only.",
};

// PRIVACY_POLICY / TERMS_OF_SERVICE are acceptance records, not ongoing
// preferences - toggling them off client-side doesn't make sense the way
// it does for the optional types below.
export const REVOCABLE_CONSENT_TYPES: ConsentType[] = [
  "MARKETING",
  "ANALYTICS",
  "THIRD_PARTY",
  "AI_PROCESSING",
];