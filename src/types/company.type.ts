export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";

// Matches COMPANY_DETAIL_SELECT on the backend exactly.
export interface Company {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  logo: string | null;
  isVerified: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterCompanyPayload {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
}

// name is intentionally NOT part of this type — the backend's
// updateCompanySchema doesn't accept it (slug-stability reasons, see
// company.validation.ts's comment).
export interface UpdateCompanyPayload {
  description?: string;
  website?: string;
  industry?: string;
  logo?: File;
}