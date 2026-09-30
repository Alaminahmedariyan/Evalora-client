export type ConsentType = "MARKETING" | "ANALYTICS" | "THIRD_PARTY" | "PRIVACY_POLICY" | "TERMS_OF_SERVICE";

export interface Consent {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt: string;
  revokedAt: string | null;
}

export interface UpdateConsentPayload {
  consentType: ConsentType;
  granted: boolean;
}