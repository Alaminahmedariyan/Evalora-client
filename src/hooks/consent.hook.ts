import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMyConsents, revokeConsent, updateConsent } from "@/api";
import type { ConsentType, UpdateConsentPayload } from "@/types";

export function useMyConsents() {
  return useQuery({ queryKey: ["consents", "me"], queryFn: getMyConsents });
}

export function useUpdateConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateConsentPayload) => updateConsent(payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["consents", "me"] }),
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (consentType: ConsentType) => revokeConsent(consentType),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["consents", "me"] }),
  });
}