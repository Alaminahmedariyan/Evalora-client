"use client";

import Link from "next/link";
import { ArrowRight, Clock3, PlayCircle, Trophy } from "lucide-react";

import type { AttemptDetail, AttemptStatus } from "@/types";
import { useMyAttempts } from "@/hooks";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { Reveal } from "@/components/ui/reveal";
import { Skeleton } from "@/components/ui/skeleton";

const FINALIZED: AttemptStatus[] = ["SUBMITTED", "AUTO_SUBMITTED", "EVALUATED"];

const STATUS_BADGE: Record<AttemptStatus, { label: string; className: string }> = {
  NOT_STARTED: { label: "Not started", className: "status-neutral" },
  IN_PROGRESS: { label: "In progress", className: "status-in-progress" },
  SUBMITTED: { label: "Submitted", className: "status-submitted" },
  AUTO_SUBMITTED: { label: "Auto-submitted", className: "status-auto-submitted" },
  EVALUATED: { label: "Evaluated", className: "status-evaluated" },
  EXPIRED: { label: "Expired", className: "status-expired" },
};

function recency(attempt: AttemptDetail) {
  return new Date(attempt.submittedAt ?? attempt.createdAt).getTime();
}

function minutesTaken(attempt: AttemptDetail) {
  if (!attempt.startedAt || !attempt.submittedAt) return null;

  const ms =
    new Date(attempt.submittedAt).getTime() -
    new Date(attempt.startedAt).getTime();

  return Math.max(1, Math.round(ms / 60000));
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CandidateResultsPage() {
  const { data, isPending, isError } = useMyAttempts();

  const attempts = data?.data ?? [];
  const inProgress = attempts.filter((a) => a.status === "IN_PROGRESS");
  const finalized = attempts
    .filter((a) => FINALIZED.includes(a.status))
    .sort((a, b) => recency(b) - recency(a));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Results</h1>
        <p className="text-sm text-muted-foreground">
          Your assessment attempts and their results.
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {["results-skeleton-1", "results-skeleton-2", "results-skeleton-3"].map(
            (id) => (
              <Skeleton key={id} className="h-20 w-full rounded-xl" />
            ),
          )}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your attempts.
        </div>
      ) : attempts.length === 0 || (inProgress.length === 0 && finalized.length === 0) ? (
        <EmptyState
          icon={Trophy}
          title="No results yet"
          description="Complete an assessment to see your results here."
        />
      ) : (
        <>
          {inProgress.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Continue where you left off</h2>

              {inProgress.map((attempt) => (
                <PremiumCard
                  key={attempt.id}
                  variant="highlight"
                  interactive={false}
                  className="flex flex-wrap items-center gap-4 p-4"
                >
                  <span className="icon-tile">
                    <PlayCircle className="size-5" aria-hidden="true" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {attempt.assessment.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your timer is still running. Ends{" "}
                      {new Date(attempt.expiresAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <Button asChild size="sm">
                    <Link href={`/exam/attempts/${attempt.id}`}>Resume attempt</Link>
                  </Button>
                </PremiumCard>
              ))}
            </section>
          ) : null}

          {finalized.length > 0 ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold">Finished attempts</h2>

              {finalized.map((attempt, index) => {
                const badge = STATUS_BADGE[attempt.status];
                const minutes = minutesTaken(attempt);

                return (
                  <Reveal key={attempt.id} delay={Math.min(index, 6) * 50}>
                    <Link
                      href={`/candidate/results/${attempt.id}`}
                      className="block"
                    >
                      <PremiumCard className="flex items-center gap-4 p-4">
                        <span className="icon-tile">
                          <Trophy className="size-5" aria-hidden="true" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {attempt.assessment.title}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                            <span>Attempt #{attempt.attemptNumber}</span>
                            {attempt.submittedAt ? (
                              <span>{formatDate(attempt.submittedAt)}</span>
                            ) : null}
                            {minutes !== null ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="size-3" aria-hidden="true" />
                                {minutes} min
                              </span>
                            ) : null}
                          </p>
                        </div>

                        <span
                          className={`hidden rounded-full border px-2.5 py-1 text-xs font-medium sm:inline-flex ${badge.className}`}
                        >
                          {badge.label}
                        </span>

                        <ArrowRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </PremiumCard>
                    </Link>
                  </Reveal>
                );
              })}
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}