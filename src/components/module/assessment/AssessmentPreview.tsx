"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";

import { getProblemById } from "@/api";
import type { AssessmentDetail } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemDetailView } from "@/components/module/problem/ProblemDetailView";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { cn } from "@/lib/utils";

export function AssessmentPreview({ assessment }: { assessment: AssessmentDetail }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const problemQueries = useQueries({
    queries: assessment.assessmentProblems.map((ap) => ({
      queryKey: ["problem", ap.problem.id],
      queryFn: () => getProblemById(ap.problem.id),
    })),
  });

  const isPending = problemQueries.some((q) => q.isPending);
  const hasError = problemQueries.some((q) => q.isError);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load one or more problems for this preview.
      </div>
    );
  }

  const current = assessment.assessmentProblems[activeIndex];
  const currentDetail = problemQueries[activeIndex]?.data?.data;

  if (!current || !currentDetail) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {assessment.assessmentProblems.map((ap, index) => (
          <button
            key={ap.problem.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "interactive flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium",
              index === activeIndex
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            <span className="stat-number">{index + 1}</span>
            {ap.problem.title}
          </button>
        ))}
      </div>

      <div className="card-evalora p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{current.problem.title}</h3>
          <div className="flex items-center gap-2">
            <ProblemTypeBadge type={current.problem.type} />
            <span className="stat-number text-sm text-muted-foreground">{current.marks} marks</span>
          </div>
        </div>
        {/* currentDetail.defaultMarks is the problem's own default — current.marks
            (from the assessment's join row) is what this specific assessment
            actually awards for it, which is what's shown above. */}
        <ProblemDetailView problem={currentDetail} />
      </div>
    </div>
  );
}