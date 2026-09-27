"use client";

import { CheckCircle2, Circle } from "lucide-react";

import type { AttemptAssessmentProblem } from "@/types";
import { cn } from "@/lib/utils";

export function QuestionNav({
  problems,
  answeredProblemIds,
  activeIndex,
  onSelect,
}: {
  problems: AttemptAssessmentProblem[];
  answeredProblemIds: Set<string>;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {problems.map((ap, index) => {
        const answered = answeredProblemIds.has(ap.problem.id);
        const active = index === activeIndex;
        return (
          <button
            key={ap.problem.id}
            type="button"
            onClick={() => onSelect(index)}
            className={cn(
              "interactive flex size-9 items-center justify-center rounded-md border text-xs font-medium",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : answered
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border text-muted-foreground hover:bg-accent",
            )}
            aria-current={active ? "true" : undefined}
            aria-label={`Question ${index + 1}${answered ? ", answered" : ", not answered"}`}
          >
            {answered && !active ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
          </button>
        );
      })}
    </div>
  );
}