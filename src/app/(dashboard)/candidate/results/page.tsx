"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";

import { useMyAttempts } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const FINALIZED_STATUSES = ["SUBMITTED", "AUTO_SUBMITTED", "EVALUATED"];

export default function CandidateResultsPage() {
  const { data, isPending, isError } = useMyAttempts();

  const finalizedAttempts = (data?.data ?? []).filter((a) => FINALIZED_STATUSES.includes(a.status));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <p className="text-sm text-muted-foreground">Your finished assessment attempts.</p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load your attempts.</div>
      ) : finalizedAttempts.length === 0 ? (
        <EmptyState icon={Trophy} title="No results yet" description="Complete an assessment to see your results here." />
      ) : (
        <div className="card-evalora flex flex-col divide-y divide-border">
          {finalizedAttempts.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/candidate/results/${attempt.id}`}
              className="interactive flex items-center justify-between px-4 py-3 text-sm hover:bg-accent/50"
            >
              <span className="font-medium">{attempt.assessment.title}</span>
              <span className="text-xs text-muted-foreground">
                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : "—"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}