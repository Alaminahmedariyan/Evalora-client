import apiClient from "@/lib/apiClient";
import type { ApiResponse, Consent, ConsentType, UpdateConsentPayload } from "@/types";

export function getMyConsents() {
  return apiClient<ApiResponse<Consent[]>>("/consents/me");
}

export function updateConsent(payload: UpdateConsentPayload) {
  return apiClient<ApiResponse<Consent>>("/consents/me", { method: "PATCH", body: payload });
}

export function revokeConsent(consentType: ConsentType) {
  return apiClient<ApiResponse<Consent>>(`/consents/me/${consentType}`, { method: "DELETE" });
}