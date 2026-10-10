"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAssessment } from "@/hooks";
import { InviteCandidatesForm } from "@/components/form";
import { AssessmentStatusBadge } from "@/components/module/assessment";
import { CompanyVerificationBanner } from "@/components/module/company/CompanyVerificationBanner";
import { Skeleton } from "@/components/ui/skeleton";
import { InvitationsManager } from "@/components/module/invitation/InvitationsManager";

const OPEN_FOR_INVITES = ["PUBLISHED", "ACTIVE"];

export default function RecruiterAssessmentInvitationsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAssessment(id);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const assessment = data.data;
  const canInvite = OPEN_FOR_INVITES.includes(assessment.status);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/recruiter/assessments/${assessment.id}`}
          className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to assessment
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
          <AssessmentStatusBadge status={assessment.status} />
        </div>

        <p className="text-sm text-muted-foreground">
          Everyone invited to <span className="font-medium text-foreground">{assessment.title}</span>.
        </p>
      </div>

      <CompanyVerificationBanner />

      {canInvite ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Invite more candidates</h2>
          <InviteCandidatesForm assessmentId={assessment.id} />
        </section>
      ) : (
        <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          {assessment.status === "DRAFT"
            ? "Publish this assessment to invite candidates."
            : "This assessment is no longer open, so new invitations can't be sent."}
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">All invitations</h2>
        <InvitationsManager assessmentId={assessment.id} />
      </section>
    </div>
  );
}