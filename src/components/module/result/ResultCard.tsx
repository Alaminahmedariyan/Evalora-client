"use client";

import { Award, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResultByAttempt } from "@/hooks";
import { ResultStatusBadge } from "./ResultStatusBadge";

export function ResultCard({ attemptId }: { attemptId: string }) {
  const { data, isPending, isError } = useResultByAttempt(attemptId);

  if (isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (isError || !data?.data) {
    return (
      <div className="status-pending rounded-md border px-4 py-3 text-sm">
        Your result isn&apos;t available yet — it will appear here once grading
        is complete.
      </div>
    );
  }

  const result = data.data;

  return (
    <Card>
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <ResultStatusBadge status={result.status} />
          {result.rank ? (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Award className="size-4" aria-hidden="true" />
              Rank #{result.rank}
            </span>
          ) : null}
        </div>

        <div className="flex items-end gap-6">
          <div>
            <p className="stat-number text-4xl font-semibold">
              {result.totalScore}
              <span className="text-lg text-muted-foreground">
                /{result.totalMarks}
              </span>
            </p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Percent className="size-3.5" aria-hidden="true" />
              {result.percentage}%
            </p>
          </div>
        </div>

        {result.status === "PENDING" ? (
          <p className="text-xs text-muted-foreground">
            Some answers are still being reviewed — your final score may change.
          </p>
        ) : null}

        {result.evaluatedAt ? (
          <p className="text-xs text-muted-foreground">
            Graded on {new Date(result.evaluatedAt).toLocaleDateString()}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
