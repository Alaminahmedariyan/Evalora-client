"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { useCancelInvitation, useInvitationsForAssessment } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail } from "lucide-react";
import { InvitationStatusBadge } from "./InvitationStatusBadge";
import { EmptyState } from "@/components/ui/empty-state";

export function InvitationList({ assessmentId }: { assessmentId: string }) {
  const [page] = useState(1);
  const { data, isPending, isError } = useInvitationsForAssessment(assessmentId, { page, limit: 20 });
  const cancelMutation = useCancelInvitation(assessmentId);

  async function handleCancel(id: string, email: string) {
    if (!window.confirm(`Cancel the invitation to ${email}?`)) return;
    try {
      await cancelMutation.mutateAsync(id);
      notify.success("Invitation cancelled");
    } catch (error) {
      notify.error("Couldn't cancel", isApiError(error) ? error.message : undefined);
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load invitations.</div>;
  }

  if (!data?.data.length) {
    return <EmptyState icon={Mail} title="No invitations sent yet" description="Invite candidates to start collecting attempts." />;
  }

  return (
    <div className="card-evalora flex flex-col divide-y divide-border">
      {data.data.map((invitation) => (
        <div key={invitation.id} className="flex items-center gap-3 px-4 py-3 text-sm">
          <span className="flex-1">{invitation.email}</span>
          <InvitationStatusBadge status={invitation.status} />
          {invitation.status === "PENDING" ? (
            <button
              type="button"
              onClick={() => handleCancel(invitation.id, invitation.email)}
              className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
              aria-label={`Cancel invitation to ${invitation.email}`}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
