"use client";

import { RefreshCw, Trophy } from "lucide-react";

import { useComputeRanks, useResultsForAssessment } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ResultStatusBadge } from "./ResultStatusBadge";

export function Leaderboard({ assessmentId }: { assessmentId: string }) {
  const { data, isPending, isError } = useResultsForAssessment(assessmentId);
  const computeMutation = useComputeRanks(assessmentId);

  async function handleComputeRanks() {
    try {
      const res = await computeMutation.mutateAsync();
      notify.success(`Ranked ${res.data.ranked} result${res.data.ranked === 1 ? "" : "s"}`);
    } catch (error) {
      notify.error("Couldn't compute ranks", isApiError(error) ? error.message : undefined);
    }
  }

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load results.</div>;
  }

  if (!data?.data.length) {
    return <EmptyState icon={Trophy} title="No results yet" description="Results appear here once candidates submit their attempts." />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleComputeRanks} isLoading={computeMutation.isPending}>
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
              <tr key={result.id} className="border-b border-border last:border-0">
                <td className="stat-number px-4 py-3">{result.rank ?? "—"}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{result.attempt.candidate.name}</p>
                  <p className="text-xs text-muted-foreground">{result.attempt.candidate.email}</p>
                </td>
                <td className="stat-number px-4 py-3">
                  {result.totalScore}/{result.totalMarks}
                  <span className="ml-1.5 text-xs text-muted-foreground">({result.percentage}%)</span>
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