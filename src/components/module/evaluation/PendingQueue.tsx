"use client";

import Link from "next/link";
import { ChevronRight, ClipboardCheck } from "lucide-react";

import { usePendingEvaluations } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";

const SKELETON_ITEMS = ["pending-evaluation-1", "pending-evaluation-2", "pending-evaluation-3"];

function waiting(submittedAt: string | null): string | null {
  if (!submittedAt) return null;

  const minutes = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m waiting`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h waiting`;

  return `${Math.floor(hours / 24)}d waiting`;
}

export function PendingQueue({ assessmentId }: { assessmentId: string }) {
  const { data, isPending, isError } = usePendingEvaluations(assessmentId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {SKELETON_ITEMS.map((id) => (
          <Skeleton key={id} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load the grading queue.</div>;
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="Nothing to grade"
        description="All coding and written submissions have been evaluated."
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {data.data.length} submission{data.data.length === 1 ? "" : "s"} waiting for review, oldest first.
      </p>

      <div className="card-evalora flex flex-col divide-y divide-border overflow-hidden">
        {data.data.map((submission) => {
          const wait = waiting(submission.submittedAt);

          return (
            <Link
              key={submission.id}
              href={`/recruiter/evaluations/${submission.id}`}
              className="interactive flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/50"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {submission.attempt?.candidate.name.charAt(0).toUpperCase() ?? "?"}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{submission.problem.title}</p>
                {submission.attempt ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {submission.attempt.candidate.name} · {submission.attempt.candidate.email}
                  </p>
                ) : null}
              </div>

              <ProblemTypeBadge type={submission.problem.type} />

              <div className="hidden w-24 text-right sm:block">
                <p className="stat-number text-xs text-muted-foreground">/{submission.problem.defaultMarks}</p>
                {wait ? <p className="text-[11px] text-muted-foreground">{wait}</p> : null}
              </div>

              <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}