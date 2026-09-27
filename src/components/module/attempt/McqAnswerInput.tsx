"use client";

import type { AttemptProblem } from "@/types";

export function McqAnswerInput({
  problem,
  selected,
  onChange,
}: {
  problem: AttemptProblem;
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  if (!problem.mcqProblem) return null;
  const isSingle = problem.mcqProblem.type === "SINGLE_CHOICE";

  return (
    <div className="flex flex-col gap-2">
      {problem.mcqProblem.options.map((option) => {
        const checked = selected.includes(option.id);
        return (
          <label
            key={option.id}
            className={`interactive flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm ${
              checked ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
            }`}
          >
            <input
              type={isSingle ? "radio" : "checkbox"}
              name={`mcq-${problem.id}`}
              checked={checked}
              onChange={() => {
                if (isSingle) onChange([option.id]);
                else onChange(checked ? selected.filter((id) => id !== option.id) : [...selected, option.id]);
              }}
              className="size-4 shrink-0"
            />
            {option.optionText}
          </label>
        );
      })}
    </div>
  );
}