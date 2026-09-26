
"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";

import type {
  Difficulty,
  McqOptionInput,
  McqType,
  ProblemDetail,
  TestCaseInput,
} from "@/types";
import { useUpdateProblem } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { updateProblemFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditMcqOption = McqOptionInput & {
  _key: string;
};

type EditTestCase = TestCaseInput & {
  _key: string;
};

export function EditProblemForm({
  problem,
  onSaved,
}: {
  problem: ProblemDetail;
  onSaved: () => void;
}) {
  const updateMutation = useUpdateProblem(problem.id);
  const [formError, setFormError] = useState<string | null>(null);

  const [mcqType, setMcqType] = useState<McqType>(
    problem.mcqProblem?.type ?? "SINGLE_CHOICE",
  );

  const [explanation, setExplanation] = useState(
    problem.mcqProblem?.explanation ?? "",
  );

  const [options, setOptions] = useState<EditMcqOption[]>(
    problem.mcqProblem?.options.map((option) => ({
      _key: option.id,
      optionText: option.optionText,
      isCorrect: option.isCorrect,
      order: option.order,
    })) ?? [],
  );

  const [testCases, setTestCases] = useState<EditTestCase[]>(
    problem.testCases.map((testCase) => ({
      _key: testCase.id,
      input: testCase.input ?? undefined,
      expectedOutput: testCase.expectedOutput,
      isSample: testCase.isSample,
      points: testCase.points,
      timeLimitMs: testCase.timeLimitMs ?? undefined,
      memoryLimitMb: testCase.memoryLimitMb ?? undefined,
    })),
  );

  const form = useForm({
    defaultValues: {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      defaultMarks: problem.defaultMarks,
      isPublic: problem.isPublic,
      timeLimitSeconds: problem.timeLimitSeconds ?? 900,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const cleanOptions: McqOptionInput[] = options.map(
        ({ _key, ...option }) => option,
      );

      const cleanTestCases: TestCaseInput[] = testCases.map(
        ({ _key, ...testCase }) => testCase,
      );

      const payload = {
        title: value.title,
        description: value.description,
        difficulty: value.difficulty,
        defaultMarks: value.defaultMarks,
        isPublic: value.isPublic,
        ...(problem.type === "MCQ" && {
          mcqType,
          explanation: explanation || undefined,
          options: cleanOptions,
        }),
        ...(problem.type === "CODING" && {
          timeLimitSeconds: value.timeLimitSeconds,
          testCases: cleanTestCases,
        }),
      };

      const parsed = updateProblemFields.safeParse(payload);

      if (!parsed.success) {
        setFormError(
          parsed.error.issues[0]?.message ??
            "Please check the form for errors.",
        );
        return;
      }

      try {
        await updateMutation.mutateAsync(payload);
        notify.success("Problem updated");
        onSaved();
      } catch (error) {
        const message = isApiError(error)
          ? error.message
          : "Couldn't update the problem.";

        setFormError(message);
        notify.error("Update failed", message);
      }
    },
  });

  function updateOption(
    index: number,
    patch: Partial<McqOptionInput>,
  ) {
    setOptions((prev) =>
      prev.map((option, currentIndex) =>
        currentIndex === index
          ? { ...option, ...patch }
          : option,
      ),
    );
  }

  function updateTestCase(
    index: number,
    patch: Partial<TestCaseInput>,
  ) {
    setTestCases((prev) =>
      prev.map((testCase, currentIndex) =>
        currentIndex === index
          ? { ...testCase, ...patch }
          : testCase,
      ),
    );
  }

  function addTestCase() {
    setTestCases((prev) => [
      ...prev,
      {
        _key: crypto.randomUUID(),
        expectedOutput: "",
        isSample: false,
      },
    ]);
  }

  function removeTestCase(index: number) {
    if (testCases.length <= 1) return;

    setTestCases((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      {formError ? (
        <div
          role="alert"
          className="status-danger rounded-md border px-3 py-2 text-sm"
        >
          {formError}
        </div>
      ) : null}

      <form.Field name="title">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Title</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Description</Label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="difficulty">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Difficulty</Label>
              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as Difficulty)
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          )}
        </form.Field>

        <form.Field name="defaultMarks">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Marks</Label>
              <Input
                id={field.name}
                type="number"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(Number(e.target.value))
                }
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Field name="isPublic">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Public problem
          </label>
        )}
      </form.Field>

      {problem.type === "MCQ" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <Label>Options</Label>

          {options.map((option, index) => (
            <div key={option._key} className="flex items-center gap-2">
              <input
                type={mcqType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                name="edit-correct-option"
                checked={option.isCorrect}
                onChange={(e) => {
                  if (mcqType === "SINGLE_CHOICE") {
                    setOptions((prev) =>
                      prev.map((currentOption, currentIndex) => ({
                        ...currentOption,
                        isCorrect: currentIndex === index,
                      })),
                    );
                  } else {
                    updateOption(index, {
                      isCorrect: e.target.checked,
                    });
                  }
                }}
                className="size-4 shrink-0"
              />

              <Input
                value={option.optionText}
                onChange={(e) =>
                  updateOption(index, {
                    optionText: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          ))}

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">
              Explanation
            </Label>

            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      ) : null}

      {problem.type === "CODING" ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <form.Field name="timeLimitSeconds">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>
                  Time limit (seconds)
                </Label>

                <Input
                  id={field.name}
                  type="number"
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(Number(e.target.value))
                  }
                  className="max-w-[160px]"
                />
              </div>
            )}
          </form.Field>

          <Label>Test cases</Label>

          {testCases.map((testCase, index) => (
            <div
              key={testCase._key}
              className="flex flex-col gap-2 rounded-md border border-border p-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <textarea
                  value={testCase.input ?? ""}
                  onChange={(e) =>
                    updateTestCase(index, {
                      input: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Input"
                  className="interactive rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                />

                <textarea
                  value={testCase.expectedOutput}
                  onChange={(e) =>
                    updateTestCase(index, {
                      expectedOutput: e.target.value,
                    })
                  }
                  rows={2}
                  placeholder="Expected output"
                  className="interactive rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={testCase.isSample ?? false}
                    onChange={(e) =>
                      updateTestCase(index, {
                        isSample: e.target.checked,
                      })
                    }
                    className="size-3.5"
                  />
                  Sample
                </label>

                <Input
                  type="number"
                  value={testCase.points ?? ""}
                  onChange={(e) =>
                    updateTestCase(index, {
                      points: Number(e.target.value),
                    })
                  }
                  className="h-8 w-20 text-xs"
                />

                <button
                  type="button"
                  onClick={() => removeTestCase(index)}
                  disabled={testCases.length <= 1}
                  className="interactive ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                >
                  <Trash2
                    className="size-3.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTestCase}
            className="self-start"
          >
            <Plus
              className="size-3.5"
              aria-hidden="true"
            />
            Add test case
          </Button>
        </div>
      ) : null}

      <div className="flex gap-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" isLoading={isSubmitting}>
              Save changes
            </Button>
          )}
        </form.Subscribe>

        <Button
          type="button"
          variant="ghost"
          onClick={onSaved}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
