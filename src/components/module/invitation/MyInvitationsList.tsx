"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarClock, Clock, Mail, Play, Target, Trophy } from "lucide-react";

import type { Invitation } from "@/types";
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useMyInvitations,
  useStartAttempt,
} from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { Skeleton } from "@/components/ui/skeleton";

import { InvitationStatusBadge } from "./InvitationStatusBadge";

const skeletonItems = ["invitation-skeleton-1", "invitation-skeleton-2", "invitation-skeleton-3"];

function expiryInfo(expiresAt: string | null) {
  if (!expiresAt) return null;

  const ms = new Date(expiresAt).getTime() - Date.now();

  if (ms <= 0) return { label: "Expired", urgent: true, expired: true };

  const hours = Math.floor(ms / 3_600_000);

  if (hours < 1) return { label: "Expires in under an hour", urgent: true, expired: false };
  if (hours < 24) return { label: `Expires in ${hours}h`, urgent: true, expired: false };

  const days = Math.floor(hours / 24);

  return {
    label: `Expires in ${days} day${days === 1 ? "" : "s"}`,
    urgent: days <= 2,
    expired: false,
  };
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {title}
        <span className="stat-number rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </h2>
      {children}
    </section>
  );
}

function InvitationCard({
  invitation,
  highlight = false,
  children,
}: {
  invitation: Invitation;
  highlight?: boolean;
  children?: React.ReactNode;
}) {
  const { assessment } = invitation;
  const expiry = expiryInfo(invitation.expiresAt);

  return (
    <PremiumCard variant={highlight ? "highlight" : "default"} interactive={false} className="flex flex-col gap-4 p-5">
      <div className="flex items-start gap-3">
        <span className="icon-tile">
          <Mail className="size-5" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{assessment.title}</p>

          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {assessment.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target className="size-3.5" aria-hidden="true" />
              {assessment.totalMarks} marks, pass at {assessment.passingMarks}
            </span>
            {expiry ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5",
                  expiry.urgent && "font-medium text-warning",
                  expiry.expired && "text-danger",
                )}
              >
                <CalendarClock className="size-3.5" aria-hidden="true" />
                {expiry.label}
              </span>
            ) : null}
          </p>
        </div>

        <InvitationStatusBadge status={invitation.status} />
      </div>

      {children ? <div className="flex flex-wrap items-center justify-end gap-2">{children}</div> : null}
    </PremiumCard>
  );
}

export function MyInvitationsList() {
  const router = useRouter();

  const { data, isPending, isError } = useMyInvitations();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const startMutation = useStartAttempt();

  const [startTarget, setStartTarget] = useState<Invitation | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Invitation | null>(null);

  const startingId = startMutation.isPending ? startMutation.variables?.assessmentId : undefined;
  const acceptingId = acceptMutation.isPending ? acceptMutation.variables : undefined;
  const decliningId = declineMutation.isPending ? declineMutation.variables : undefined;

  async function handleStart(assessmentId: string) {
    try {
      const res = await startMutation.mutateAsync({
        assessmentId,
        idempotencyKey: newIdempotencyKey(),
      });

      router.push(`/exam/attempts/${res.data.id}`);
    } catch (error) {
      notify.error("Couldn't start attempt", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleAccept(id: string) {
    try {
      await acceptMutation.mutateAsync(id);

      notify.success("Invitation accepted", "You can start the assessment from here whenever you're ready.");
    } catch (error) {
      notify.error("Couldn't accept", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDecline(id: string) {
    try {
      await declineMutation.mutateAsync(id);
      notify.success("Invitation declined");
    } catch (error) {
      notify.error("Couldn't decline", isApiError(error) ? error.message : undefined);
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load your invitations.</div>;
  }

  const invitations = data?.data ?? [];

  if (invitations.length === 0) {
    return (
      <EmptyState
        icon={Mail}
        title="No invitations yet"
        description="Assessment invitations from companies will show up here."
      />
    );
  }

  const ready = invitations.filter((i) => i.status === "ACCEPTED");
  const awaiting = invitations.filter((i) => i.status === "PENDING");
  const past = invitations.filter(
    (i) => i.status === "DECLINED" || i.status === "EXPIRED" || i.status === "COMPLETED",
  );

  return (
    <div className="flex flex-col gap-8">
      {ready.length > 0 ? (
        <Section title="Ready to start" count={ready.length}>
          {ready.map((invitation) => {
            const expired = expiryInfo(invitation.expiresAt)?.expired ?? false;

            return (
              <InvitationCard key={invitation.id} invitation={invitation} highlight>
                <Button
                  size="sm"
                  disabled={expired}
                  isLoading={startingId === invitation.assessment.id}
                  onClick={() => setStartTarget(invitation)}
                >
                  <Play className="size-3.5" aria-hidden="true" />
                  Start assessment
                </Button>
              </InvitationCard>
            );
          })}
        </Section>
      ) : null}

      {awaiting.length > 0 ? (
        <Section title="Waiting for your response" count={awaiting.length}>
          {awaiting.map((invitation) => {
            const expired = expiryInfo(invitation.expiresAt)?.expired ?? false;

            return (
              <InvitationCard key={invitation.id} invitation={invitation}>
                <Button
                  size="sm"
                  disabled={expired}
                  onClick={() => void handleAccept(invitation.id)}
                  isLoading={acceptingId === invitation.id}
                >
                  Accept
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeclineTarget(invitation)}
                  isLoading={decliningId === invitation.id}
                >
                  Decline
                </Button>
              </InvitationCard>
            );
          })}
        </Section>
      ) : null}

      {past.length > 0 ? (
        <Section title="Past invitations" count={past.length}>
          {past.map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation}>
              {invitation.status === "COMPLETED" ? (
                <Button asChild size="sm" variant="outline">
                  <Link href="/candidate/results">
                    <Trophy className="size-3.5" aria-hidden="true" />
                    View results
                  </Link>
                </Button>
              ) : null}
            </InvitationCard>
          ))}
        </Section>
      ) : null}

      <ConfirmDialog
        open={startTarget !== null}
        onOpenChange={(open) => {
          if (!open) setStartTarget(null);
        }}
        title={startTarget ? `Start "${startTarget.assessment.title}"?` : "Start assessment?"}
        description="Read this before you begin."
        confirmLabel="Start now"
        onConfirm={() => {
          if (startTarget) void handleStart(startTarget.assessment.id);
        }}
      >
        {startTarget ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-border p-3">
              <p className="stat-number text-lg font-semibold">{startTarget.assessment.durationMinutes}</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="stat-number text-lg font-semibold">{startTarget.assessment.totalMarks}</p>
              <p className="text-xs text-muted-foreground">Total marks</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="stat-number text-lg font-semibold">{startTarget.assessment.passingMarks}</p>
              <p className="text-xs text-muted-foreground">To pass</p>
            </div>
          </div>
        ) : null}

        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
          <li>The timer starts immediately and can&apos;t be paused.</li>
          <li>Your answers are saved automatically as you type.</li>
          <li>
            You&apos;ll be asked to use full screen. Leaving full screen, switching tabs, and copy or paste are
            recorded and visible to the recruiter.
          </li>
          <li>Keep a stable internet connection until you submit.</li>
        </ul>
      </ConfirmDialog>

      <ConfirmDialog
        open={declineTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeclineTarget(null);
        }}
        title="Decline this invitation?"
        description={
          declineTarget ? `You won't be able to take "${declineTarget.assessment.title}" after declining.` : undefined
        }
        confirmLabel="Decline"
        variant="destructive"
        onConfirm={() => {
          if (declineTarget) void handleDecline(declineTarget.id);
        }}
      />
    </div>
  );
}