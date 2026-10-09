
"use client";

import type { ReactNode } from "react";
import { Check, Plus, Trash2 } from "lucide-react";

import type { McqOptionInput, McqType, TestCaseInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const TEXTAREA_CLASS =
  "interactive flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const SELECT_CLASS =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type KeyedOption = McqOptionInput & { _key: string };
export type KeyedTestCase = TestCaseInput & { _key: string };

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="card-evalora flex flex-col gap-5 p-5 md:p-6">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function McqOptionsEditor({
  options,
  mcqType,
  onChange,
  onMcqTypeChange,
  canResize,
}: {
  options: KeyedOption[];
  mcqType: McqType;
  onChange: (options: KeyedOption[]) => void;
  // When omitted, the choice type is fixed and no selector is shown.
  onMcqTypeChange?: (type: McqType) => void;
  canResize: boolean;
}) {
  const single = mcqType === "SINGLE_CHOICE";
  const correctCount = options.filter((option) => option.isCorrect).length;

  function update(index: number, patch: Partial<McqOptionInput>) {
    onChange(
      options.map((option, i) => (i === index ? { ...option, ...patch } : option)),
    );
  }

  function setCorrect(index: number) {
    if (single) {
      onChange(options.map((option, i) => ({ ...option, isCorrect: i === index })));
    } else {
      update(index, { isCorrect: !options[index]?.isCorrect });
    }
  }

  function add() {
    if (options.length >= 10) return;

    onChange([
      ...options,
      {
        _key: crypto.randomUUID(),
        optionText: "",
        isCorrect: false,
        order: options.length + 1,
      },
    ]);
  }

  function remove(index: number) {
    if (options.length <= 2) return;

    onChange(
      options
        .filter((_, i) => i !== index)
        .map((option, i) => ({ ...option, order: i + 1 })),
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {single
            ? "Click the circle next to the one correct answer."
            : "Click the box next to every correct answer."}
        </p>

        {onMcqTypeChange ? (
          <select
            value={mcqType}
            onChange={(e) => onMcqTypeChange(e.target.value as McqType)}
            aria-label="Choice type"
            className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
          >
            <option value="SINGLE_CHOICE">Single choice</option>
            <option value="MULTIPLE_CHOICE">Multiple choice</option>
          </select>
        ) : null}
      </div>

      {options.map((option, index) => (
        <div key={option._key} className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={option.isCorrect}
            aria-label={`Option ${index + 1} ${option.isCorrect ? "is correct" : "is not marked correct"}`}
            onClick={() => setCorrect(index)}
            className={cn(
              "interactive flex size-9 shrink-0 items-center justify-center border text-xs font-semibold",
              single ? "rounded-full" : "rounded-md",
              option.isCorrect
                ? "border-success bg-success text-success-foreground"
                : "border-border text-muted-foreground hover:border-success/60",
            )}
          >
            {option.isCorrect ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              String.fromCharCode(65 + index)
            )}
          </button>

          <Input
            value={option.optionText}
            onChange={(e) => update(index, { optionText: e.target.value })}
            placeholder={`Option ${index + 1}`}
            className="flex-1"
          />

          {canResize ? (
            <button
              type="button"
              onClick={() => remove(index)}
              disabled={options.length <= 2}
              className="interactive rounded-md p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Remove option ${index + 1}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ))}

      {correctCount === 0 ? (
        <p className="text-xs text-warning">No correct answer marked yet.</p>
      ) : null}

      {canResize ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={add}
          disabled={options.length >= 10}
          className="self-start"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add option
        </Button>
      ) : null}
    </div>
  );
}

export function TestCasesEditor({
  testCases,
  onChange,
}: {
  testCases: KeyedTestCase[];
  onChange: (testCases: KeyedTestCase[]) => void;
}) {
  function update(index: number, patch: Partial<TestCaseInput>) {
    onChange(
      testCases.map((testCase, i) =>
        i === index ? { ...testCase, ...patch } : testCase,
      ),
    );
  }

  function add() {
    onChange([
      ...testCases,
      { _key: crypto.randomUUID(), expectedOutput: "", isSample: false },
    ]);
  }

  function remove(index: number) {
    if (testCases.length <= 1) return;
    onChange(testCases.filter((_, i) => i !== index));
  }

  const totalPoints = testCases.reduce(
    (sum, testCase) => sum + (testCase.points ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Sample test cases are shown to candidates. Hidden ones are only for you
        when grading. {testCases.length} test case
        {testCases.length === 1 ? "" : "s"}, {totalPoints} points in total.
      </p>

      {testCases.map((testCase, index) => (
        <div
          key={testCase._key}
          className="flex flex-col gap-3 rounded-xl border border-border p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              Test case {index + 1}
            </span>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={testCase.isSample ?? false}
                  onChange={(e) => update(index, { isSample: e.target.checked })}
                  className="size-3.5"
                />
                Sample (visible to candidate)
              </label>

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={testCases.length <= 1}
                className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                aria-label={`Remove test case ${index + 1}`}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Input</Label>
              <textarea
                value={testCase.input ?? ""}
                onChange={(e) => update(index, { input: e.target.value })}
                rows={3}
                className={cn(TEXTAREA_CLASS, "font-mono text-xs")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">
                Expected output
              </Label>
              <textarea
                value={testCase.expectedOutput}
                onChange={(e) =>
                  update(index, { expectedOutput: e.target.value })
                }
                rows={3}
                className={cn(TEXTAREA_CLASS, "font-mono text-xs")}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Points</Label>
            <Input
              type="number"
              min={0}
              value={testCase.points ?? ""}
              onChange={(e) =>
                update(index, { points: Number(e.target.value) })
              }
              className="h-8 w-24 text-xs"
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="self-start"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Add test case
      </Button>
    </div>
  );
}