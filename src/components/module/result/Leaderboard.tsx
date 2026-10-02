"use client";

import Link from "next/link";
import { RefreshCw, Trophy } from "lucide-react";

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

export function Leaderboard({
  assessmentId,
}: {
  assessmentId: string;
}) {
  const { data, isPending, isError } =
    useResultsForAssessment(assessmentId);

  const computeMutation = useComputeRanks(assessmentId);

  async function handleComputeRanks() {
    try {
      const res = await computeMutation.mutateAsync();

      notify.success(
        `Ranked ${res.data.ranked} result${
          res.data.ranked === 1 ? "" : "s"
        }`,
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
      <div className="flex flex-col gap-2">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-12 w-full" />
        ))}
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

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={Trophy}
        title="No results yet"
        description="Results appear here once candidates submit their attempts."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.data.map((result) => (
              <tr
                key={result.id}
                className="interactive border-b border-border last:border-0 hover:bg-accent/50"
              >
                <td className="stat-number px-4 py-3">
                  {result.rank ?? "—"}
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
                    </p>
                  </Link>
                </td>

                <td className="stat-number px-4 py-3">
                  {result.totalScore}/{result.totalMarks}

                  <span className="ml-1.5 text-xs text-muted-foreground">
                    ({result.percentage}%)
                  </span>
                </td>

                <td className="px-4 py-3">
                  <ResultStatusBadge status={result.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}