"use client";

import { Check } from "lucide-react";

import type { AttemptProblem } from "@/types";
import { cn } from "@/lib/utils";

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
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-1 text-xs font-medium text-muted-foreground">
        {isSingle ? "Select one answer" : "Select all that apply"}
      </legend>

      {problem.mcqProblem.options.map((option, index) => {
        const checked = selected.includes(option.id);

        return (
          <label
            key={option.id}
            className={cn(
              "interactive flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              checked
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 hover:bg-accent",
            )}
          >
            <input
              type={isSingle ? "radio" : "checkbox"}
              name={`mcq-${problem.id}`}
              checked={checked}
              onChange={() => {
                if (isSingle) onChange([option.id]);
                else onChange(checked ? selected.filter((id) => id !== option.id) : [...selected, option.id]);
              }}
              className="sr-only"
            />

            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center border text-xs font-semibold",
                isSingle ? "rounded-full" : "rounded-md",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {checked ? <Check className="size-3.5" /> : String.fromCharCode(65 + index)}
            </span>

            <span className="flex-1 leading-relaxed">{option.optionText}</span>
          </label>
        );
      })}

      {selected.length > 0 ? (
        <button
          type="button"
          onClick={() => onChange([])}
          className="interactive self-start text-xs text-muted-foreground hover:text-foreground"
        >
          Clear answer
        </button>
      ) : null}
    </fieldset>
  );
}