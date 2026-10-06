"use client";

import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { usePendingEvaluations } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";

const SKELETON_ITEMS = [
  "pending-evaluation-1",
  "pending-evaluation-2",
  "pending-evaluation-3",
];

export function PendingQueue({ assessmentId }: { assessmentId: string }) {
  const { data, isPending, isError } = usePendingEvaluations(assessmentId);

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {SKELETON_ITEMS.map((id) => (
          <Skeleton key={id} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load the grading queue.
      </div>
    );
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
    <div className="card-evalora flex flex-col divide-y divide-border">
      {data.data.map((submission) => (
        <Link
          key={submission.id}
          href={`/recruiter/evaluations/${submission.id}`}
          className="interactive flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent/50"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{submission.problem.title}</p>
            {submission.attempt ? (
              <p className="truncate text-xs text-muted-foreground">
                {submission.attempt.candidate.name} · {submission.attempt.candidate.email}
              </p>
            ) : null}
          </div>
          <ProblemTypeBadge type={submission.problem.type} />
          <span className="stat-number w-16 text-right text-xs text-muted-foreground">
            /{submission.problem.defaultMarks}
          </span>
        </Link>
      ))}
    </div>
  );
}