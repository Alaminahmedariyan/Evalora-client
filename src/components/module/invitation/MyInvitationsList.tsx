"use client";

import { useRouter } from "next/navigation";
import { Mail } from "lucide-react";

import {
  useAcceptInvitation,
  useDeclineInvitation,
  useMyInvitations,
  useStartAttempt,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

import { InvitationStatusBadge } from "./InvitationStatusBadge";

const skeletonItems = [
  "invitation-skeleton-1",
  "invitation-skeleton-2",
  "invitation-skeleton-3",
];

export function MyInvitationsList() {
  const router = useRouter();

  const { data, isPending, isError } = useMyInvitations();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const startMutation = useStartAttempt();

  async function handleStart(assessmentId: string) {
    try {
      const res = await startMutation.mutateAsync(assessmentId);
      router.push(`/exam/attempts/${res.data.id}`);
    } catch (error) {
      notify.error(
        "Couldn't start attempt",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleAccept(id: string) {
    try {
      await acceptMutation.mutateAsync(id);

      notify.success(
        "Invitation accepted",
        "You can start the assessment from here whenever you're ready.",
      );
    } catch (error) {
      notify.error(
        "Couldn't accept",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleDecline(id: string) {
    if (!window.confirm("Decline this invitation?")) return;

    try {
      await declineMutation.mutateAsync(id);
      notify.success("Invitation declined");
    } catch (error) {
      notify.error(
        "Couldn't decline",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load your invitations.
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations yet"
        description="Assessment invitations from companies will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.data.map((invitation) => (
        <Card key={invitation.id}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {invitation.assessment.title}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {invitation.assessment.durationMinutes} min ·{" "}
                {invitation.assessment.totalMarks} marks
                {invitation.expiresAt
                  ? ` · Expires ${new Date(
                      invitation.expiresAt,
                    ).toLocaleDateString()}`
                  : ""}
              </p>
            </div>

            <InvitationStatusBadge status={invitation.status} />

            {invitation.status === "ACCEPTED" ? (
              <Button
                size="sm"
                onClick={() => handleStart(invitation.assessment.id)}
                isLoading={startMutation.isPending}
              >
                Start assessment
              </Button>
            ) : invitation.status === "PENDING" ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAccept(invitation.id)}
                  isLoading={acceptMutation.isPending}
                >
                  Accept
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation.id)}
                  isLoading={declineMutation.isPending}
                >
                  Decline
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}