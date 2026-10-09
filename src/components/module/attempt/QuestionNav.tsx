"use client";

import { Flag } from "lucide-react";

import type { AttemptAssessmentProblem } from "@/types";
import { cn } from "@/lib/utils";

export function QuestionNav({
  problems,
  answeredProblemIds,
  flaggedProblemIds,
  activeIndex,
  onSelect,
}: {
  problems: AttemptAssessmentProblem[];
  answeredProblemIds: Set<string>;
  flaggedProblemIds?: Set<string>;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {problems.map((ap, index) => {
        const answered = answeredProblemIds.has(ap.problem.id);
        const flagged = flaggedProblemIds?.has(ap.problem.id) ?? false;
        const active = index === activeIndex;

        return (
          <button
            key={ap.problem.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "interactive relative flex size-10 items-center justify-center rounded-lg border text-sm font-medium",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : answered
                  ? "border-success/40 bg-success/10 text-success hover:bg-success/20"
                  : "border-border text-muted-foreground hover:bg-accent",
            )}
            aria-current={active ? "true" : undefined}
            aria-label={`Question ${index + 1}, ${answered ? "answered" : "not answered"}${flagged ? ", marked for review" : ""}`}
          >
            {index + 1}

            {flagged ? (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-warning text-warning-foreground">
                <Flag className="size-2.5" aria-hidden="true" />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}