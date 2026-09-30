"use client";

import { AlertCircle, BarChart3, Mail, Trophy, UserCircle } from "lucide-react";

import { useMyAttempts, useMyCandidateProfile, useMyInvitations } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, QuickLinkCard } from "@/components/dashboard";

const FINALIZED_STATUSES = ["SUBMITTED", "AUTO_SUBMITTED", "EVALUATED"];

const skeletonItems = [
  "candidate-stat-skeleton-1",
  "candidate-stat-skeleton-2",
  "candidate-stat-skeleton-3",
];

export default function CandidateHomePage() {
  const { data: invitationsRes, isPending: invitationsPending } = useMyInvitations();
  const { data: attemptsRes, isPending: attemptsPending } = useMyAttempts();
  const { data: profileRes, isError: noProfile } = useMyCandidateProfile();

  const isPending = invitationsPending || attemptsPending;

  const pendingInvitations = (invitationsRes?.data ?? []).filter(
    (i) => i.status === "PENDING",
  ).length;

  const readyToStart = (invitationsRes?.data ?? []).filter(
    (i) => i.status === "ACCEPTED",
  ).length;

  const finishedAttempts = (attemptsRes?.data ?? []).filter((a) =>
    FINALIZED_STATUSES.includes(a.status),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {profileRes?.data ? `Welcome back, ${profileRes.data.user.name}` : "Welcome"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s where things stand with your assessments.
        </p>
      </div>

      {noProfile ? (
        <div className="status-pending flex items-center gap-3 rounded-md border px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">
            Your profile is incomplete — recruiters see this when reviewing your application.
          </span>
          <QuickLinkCard
            href="/candidate/profile"
            icon={UserCircle}
            title=""
            description=""
          />
        </div>
      ) : null}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {skeletonItems.map((id) => (
            <Skeleton key={id} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="New invitations"
            value={pendingInvitations}
            icon={Mail}
            accent={pendingInvitations > 0 ? "primary" : "success"}
          />
          <StatCard
            label="Ready to start"
            value={readyToStart}
            icon={BarChart3}
            accent={readyToStart > 0 ? "warning" : "success"}
          />
          <StatCard
            label="Completed"
            value={finishedAttempts}
            icon={Trophy}
            accent="success"
          />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <QuickLinkCard
            href="/candidate/invitations"
            icon={Mail}
            title="My invitations"
            description="Accept, decline, or start an assessment."
          />

          <QuickLinkCard
            href="/candidate/results"
            icon={Trophy}
            title="My results"
            description="See how you scored on completed assessments."
          />

          <QuickLinkCard
            href="/candidate/profile"
            icon={UserCircle}
            title="Edit profile"
            description="Keep your resume and skills up to date."
          />
        </div>
      </div>
    </div>
  );
}