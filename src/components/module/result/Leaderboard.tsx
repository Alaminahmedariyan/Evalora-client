"use client";

import Link from "next/link";
import {
  Hourglass,
  Medal,
  Percent,
  RefreshCw,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { useComputeRanks, useResultsForAssessment } from "@/hooks";
import { ResultStatusBadge } from "./ResultStatusBadge";

const skeletonItems = [
  "leaderboard-skeleton-1",
  "leaderboard-skeleton-2",
  "leaderboard-skeleton-3",
];

const MEDAL_COLORS = ["text-amber-500", "text-slate-400", "text-orange-600"];

const BAR_COLORS = {
  PASSED: "bg-emerald-500",
  FAILED: "bg-rose-500",
  PENDING: "bg-amber-500",
} as const;

function RankCell({ rank }: { rank: number | null }) {
  if (rank === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (rank <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <Medal
          className={cn("size-4", MEDAL_COLORS[rank - 1])}
          aria-hidden="true"
        />
        <span className="stat-number font-semibold">{rank}</span>
      </span>
    );
  }

  return <span className="stat-number">{rank}</span>;
}

function SummaryTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="card-evalora flex items-center gap-3 p-4">
      <span className="icon-tile size-10">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div>
        <p className="stat-number text-lg font-semibold leading-tight">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function Leaderboard({ assessmentId }: { assessmentId: string }) {
  const { data, isPending, isError } = useResultsForAssessment(assessmentId);
  const computeMutation = useComputeRanks(assessmentId);

  async function handleComputeRanks() {
    try {
      const res = await computeMutation.mutateAsync();

      notify.success(
        `Ranked ${res.data.ranked} result${res.data.ranked === 1 ? "" : "s"}`,
      );
    } catch (error) {
      notify.error(
        "Couldn't compute ranks",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {skeletonItems.concat("leaderboard-skeleton-4").map((id) => (
            <Skeleton key={id} className="h-[74px] w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load results.
      </div>
    );
  }

  const results = data?.data ?? [];

  if (results.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="No results yet"
        description="Results appear here once candidates submit their attempts."
      />
    );
  }

  const passed = results.filter((r) => r.status === "PASSED").length;
  const failed = results.filter((r) => r.status === "FAILED").length;
  const pending = results.filter((r) => r.status === "PENDING").length;
  const graded = passed + failed;
  const passRate = graded > 0 ? Math.round((passed / graded) * 100) : 0;
  const average =
    Math.round(
      (results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) /
        results.length) *
        10,
    ) / 10;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile
          icon={Users}
          label="Candidates"
          value={String(results.length)}
        />
        <SummaryTile
          icon={Trophy}
          label="Pass rate"
          value={graded > 0 ? `${passRate}%` : "—"}
        />
        <SummaryTile
          icon={Percent}
          label="Average score"
          value={`${average}%`}
        />
        <SummaryTile
          icon={Hourglass}
          label="Awaiting grading"
          value={String(pending)}
        />
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleComputeRanks}
          isLoading={computeMutation.isPending}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Compute ranks
        </Button>
      </div>

      <div className="card-evalora overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Candidate</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => {
                const percentage = Math.min(
                  100,
                  Math.max(0, Number(result.percentage) || 0),
                );

                return (
                  <tr
                    key={result.id}
                    className={cn(
                      "interactive border-b border-border last:border-0 hover:bg-accent/50",
                      result.rank !== null && result.rank <= 3 && "bg-primary/[0.03]",
                    )}
                  >
                    <td className="px-4 py-3">
                      <RankCell rank={result.rank} />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        href={`/recruiter/attempts/${result.attempt.id}`}
                        className="hover:text-primary"
                      >
                        <p className="font-medium">
                          {result.attempt.candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {result.attempt.candidate.email}
                          {result.attempt.attemptNumber > 1
                            ? ` · Attempt #${result.attempt.attemptNumber}`
                            : ""}
                        </p>
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="stat-number w-16 shrink-0 font-medium">
                          {result.totalScore}/{result.totalMarks}
                        </span>
                        <div className="h-1.5 w-24 rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              BAR_COLORS[result.status],
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="stat-number text-xs text-muted-foreground">
                          {Math.round(percentage * 10) / 10}%
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <ResultStatusBadge status={result.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}