"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Hash, SkipForward, User } from "lucide-react";

import { usePendingEvaluations, useSubmission } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EvaluateSubmissionForm } from "@/components/form";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";

export default function EvaluateSubmissionPage() {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { data, isPending, isError } = useSubmission(submissionId);

  // The grading queue of the assessment this submission belongs to. It stays
  // idle until the submission has loaded (and until the backend sends the
  // assessment id), and "Save & next" simply isn't offered without it.
  const assessmentId = data?.data?.attempt?.assessmentId ?? "";
  const { data: pendingData, isSuccess: queueReady } = usePendingEvaluations(assessmentId);

  const otherPending = (pendingData?.data ?? []).filter((submission) => submission.id !== submissionId);
  const nextSubmissionId = otherPending[0]?.id ?? null;

  // Warm the cache so the next submission opens instantly.
  useSubmission(nextSubmissionId ?? "");

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const submission = data.data;
  const candidate = submission.attempt?.candidate;
  const graded = submission.evaluation?.status === "COMPLETED";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/recruiter/evaluations"
            className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Evaluations
          </Link>

          {queueReady ? (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {otherPending.length === 0
                  ? "Nothing else waiting in this assessment"
                  : `${otherPending.length} more waiting in this assessment`}
              </span>

              {nextSubmissionId ? (
                <Link
                  href={`/recruiter/evaluations/${nextSubmissionId}`}
                  className="interactive inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:bg-accent"
                >
                  <SkipForward className="size-3.5" aria-hidden="true" />
                  Skip
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{submission.problem.title}</h1>
          <ProblemTypeBadge type={submission.problem.type} />
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${graded ? "status-evaluated" : "status-pending"}`}
          >
            {graded ? "Graded" : "Needs grading"}
          </span>
        </div>

        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {candidate ? (
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5" aria-hidden="true" />
              {candidate.name} · {candidate.email}
            </span>
          ) : null}

          {submission.attempt ? (
            <span className="inline-flex items-center gap-1.5">
              <Hash className="size-3.5" aria-hidden="true" />
              Attempt #{submission.attempt.attemptNumber}
            </span>
          ) : null}

          {submission.submittedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="size-3.5" aria-hidden="true" />
              Submitted {new Date(submission.submittedAt).toLocaleString()}
            </span>
          ) : null}
        </p>
      </div>

      {/* key: moving to the next submission keeps this page mounted, so the
          form must be rebuilt or it would keep the previous score. */}
      <EvaluateSubmissionForm
        key={submission.id}
        submission={submission}
        queue={{ ready: queueReady, nextSubmissionId }}
      />
    </div>
  );
}