"use client";

import { ShieldQuestion } from "lucide-react";

import { useMyCompany } from "@/hooks";
import { useRequestCompanyVerification } from "@/hooks/company.hook";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";

/**
 * Explains why publishing is blocked while the company is unverified, and
 * lets the owner remind the admins. Renders nothing once verified.
 */
export function CompanyVerificationBanner() {
  const { data } = useMyCompany();
  const requestMutation = useRequestCompanyVerification();

  const company = data?.data;

  if (!company || company.isVerified) return null;

  async function handleRemind() {
    try {
      await requestMutation.mutateAsync();
      notify.success("Admins notified", "You'll get a notification as soon as your company is verified.");
    } catch (error) {
      const message = isApiError(error) ? error.message : undefined;

      if (isApiError(error) && error.statusCode === 429) {
        notify.info("Already requested", message);
      } else {
        notify.error("Couldn't send the request", message);
      }
    }
  }

  return (
    <output className="flex flex-wrap items-center gap-4 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
        <ShieldQuestion className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Your company is awaiting verification</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          An admin has to verify {company.name} before you can publish assessments or invite candidates. Until then you can create problems
          and draft assessments.
        </p>
      </div>

      <Button size="sm" variant="outline" onClick={() => void handleRemind()} isLoading={requestMutation.isPending}>
        Remind admins
      </Button>
    </output>
  );
}
