"use client";

import { Switch } from "@/components/ui/switch";
import { useMyConsents, useUpdateConsent } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { CONSENT_TYPE_LABEL, REVOCABLE_CONSENT_TYPES } from "@/constants/consent";
import { Skeleton } from "@/components/ui/skeleton";
import type { ConsentType } from "@/types";

export function ConsentToggleList() {
  const { data, isPending } = useMyConsents();
  const updateMutation = useUpdateConsent();

  async function handleToggle(consentType: ConsentType, granted: boolean) {
    try {
      await updateMutation.mutateAsync({ consentType, granted });
      notify.success(granted ? "Consent granted" : "Consent revoked");
    } catch (error) {
      notify.error("Couldn't update consent", isApiError(error) ? error.message : undefined);
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const consents = (data?.data ?? []).filter((c) => REVOCABLE_CONSENT_TYPES.includes(c.consentType));

  return (
    <div className="flex flex-col divide-y divide-border">
      {consents.map((consent) => (
        <div key={consent.consentType} className="flex items-center justify-between py-3">
          <span className="text-sm">{CONSENT_TYPE_LABEL[consent.consentType]}</span>
          <Switch checked={consent.granted} onCheckedChange={(checked) => handleToggle(consent.consentType, checked)} disabled={updateMutation.isPending} />
        </div>
      ))}
    </div>
  );
}