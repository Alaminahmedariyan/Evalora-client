"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAttempt, useResultByAttempt } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptSummaryCard, ProctoringTimeline } from "@/components/module/attempt";
import { AttemptSubmissionList } from "@/components/module/attempt/AttemptSubmissionList";

export default function RecruiterAttemptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAttempt(id);
  // Not-yet-graded attempts legitimately have no result; that's fine here.
  const { data: resultData } = useResultByAttempt(id);

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const attempt = data.data;
  const candidate = attempt.candidate;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href={`/recruiter/assessments/${attempt.assessmentId}/results`}
          className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Results &amp; leaderboard
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
            {candidate ? candidate.name.charAt(0).toUpperCase() : "?"}
          </span>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {candidate ? candidate.name : attempt.assessment.title}
            </h1>
            <p className="truncate text-sm text-muted-foreground">
              {candidate ? `${candidate.email} · ` : ""}
              {attempt.assessment.title}
            </p>
          </div>
        </div>
      </div>

      <AttemptSummaryCard attempt={attempt} result={resultData?.data ?? null} />

      <section>
        <h2 className="mb-3 text-sm font-semibold">Answers</h2>
        <AttemptSubmissionList attempt={attempt} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Proctoring timeline</h2>
        <div className="card-evalora p-5">
          <ProctoringTimeline attemptId={attempt.id} />
        </div>
      </section>
    </div>
  );
}