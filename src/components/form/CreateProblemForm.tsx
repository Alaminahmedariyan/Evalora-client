"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { Plus, Trash2 } from "lucide-react";

import type {
  CreateProblemPayload,
  Difficulty,
  McqOptionInput,
  McqType,
  TestCaseInput,
} from "@/types";
import { useCreateProblem } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { createProblemSchema, baseProblemFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProblemTypeChoice = "MCQ" | "CODING" | "WRITTEN";

type CreateMcqOption = McqOptionInput & {
  _key: string;
};

type CreateTestCase = TestCaseInput & {
  _key: string;
};

function createKey() {
  return crypto.randomUUID();
}

const emptyOption = (order: number): CreateMcqOption => ({
  _key: createKey(),
  optionText: "",
  isCorrect: false,
  order,
});

const emptyTestCase = (): CreateTestCase => ({
  _key: createKey(),
  expectedOutput: "",
  isSample: false,
});

export function CreateProblemForm() {
  const router = useRouter();
  const createMutation = useCreateProblem();
  const [formError, setFormError] = useState<string | null>(null);

  const [problemType, setProblemType] =
    useState<ProblemTypeChoice>("MCQ");

  const [mcqType, setMcqType] =
    useState<McqType>("SINGLE_CHOICE");

  const [explanation, setExplanation] = useState("");

  const [options, setOptions] = useState<CreateMcqOption[]>([
    emptyOption(1),
    emptyOption(2),
  ]);

  const [testCases, setTestCases] = useState<CreateTestCase[]>([
    emptyTestCase(),
  ]);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      difficulty: "MEDIUM" as Difficulty,
      defaultMarks: 10,
      isPublic: false,
      timeLimitSeconds: 900,
    },

    onSubmit: async ({ value }) => {
      setFormError(null);

      const base = {
        title: value.title,
        description: value.description,
        difficulty: value.difficulty,
        defaultMarks: value.defaultMarks,
        isPublic: value.isPublic,
      };

      const cleanOptions: McqOptionInput[] = options.map(
        ({ _key, ...option }) => option,
      );

      const cleanTestCases: TestCaseInput[] = testCases.map(
        ({ _key, ...testCase }) => testCase,
      );

      let payload: CreateProblemPayload;

      if (problemType === "MCQ") {
        payload = {
          ...base,
          type: "MCQ",
          mcqType,
          explanation: explanation || undefined,
          options: cleanOptions,
        };
      } else if (problemType === "CODING") {
        payload = {
          ...base,
          type: "CODING",
          timeLimitSeconds: value.timeLimitSeconds,
          testCases: cleanTestCases,
        };
      } else {
        payload = {
          ...base,
          type: "WRITTEN",
        };
      }

      const parsed = createProblemSchema.safeParse(payload);

      if (!parsed.success) {
        const firstIssue = parsed.error.issues[0];

        setFormError(
          firstIssue?.message ??
            "Please check the form for errors.",
        );

        return;
      }

      try {
        await createMutation.mutateAsync(payload);

        celebrate();
        notify.success("Problem created!");
        router.push("/recruiter/problems");
      } catch (error) {
        const message = isApiError(error)
          ? error.message
          : "Couldn't create the problem.";

        setFormError(message);
        notify.error("Creation failed", message);
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

  function addOption() {
    if (options.length >= 10) return;

    setOptions((prev) => [
      ...prev,
      emptyOption(prev.length + 1),
    ]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;

    setOptions((prev) =>
      prev
        .filter((_, currentIndex) => currentIndex !== index)
        .map((option, currentIndex) => ({
          ...option,
          order: currentIndex + 1,
        })),
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
      emptyTestCase(),
    ]);
  }

  function removeTestCase(index: number) {
    if (testCases.length <= 1) return;

    setTestCases((prev) =>
      prev.filter(
        (_, currentIndex) => currentIndex !== index,
      ),
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-6"
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

      <div className="flex flex-col gap-1.5">
        <Label>Problem type</Label>

        <div className="grid grid-cols-3 gap-2">
          {(
            ["MCQ", "CODING", "WRITTEN"] as ProblemTypeChoice[]
          ).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setProblemType(type)}
              className={`interactive rounded-md border px-3 py-2 text-sm font-medium ${
                problemType === type
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              {type === "MCQ"
                ? "MCQ"
                : type === "CODING"
                  ? "Coding"
                  : "Written"}
            </button>
          ))}
        </div>
      </div>

      <form.Field
        name="title"
        validators={{
          onBlur: ({ value }) =>
            baseProblemFields.shape.title.safeParse(value)
              .error?.issues[0]?.message,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Title</Label>

            <Input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value)
              }
              placeholder="Two Sum"
            />

            {field.state.meta.errors[0] ? (
              <p className="text-xs text-danger">
                {String(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{
          onBlur: ({ value }) =>
            baseProblemFields.shape.description.safeParse(value)
              .error?.issues[0]?.message,
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>
              Description
            </Label>

            <textarea
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) =>
                field.handleChange(e.target.value)
              }
              rows={4}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Describe the problem candidates will solve..."
            />

            {field.state.meta.errors[0] ? (
              <p className="text-xs text-danger">
                {String(field.state.meta.errors[0])}
              </p>
            ) : null}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="difficulty">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>
                Difficulty
              </Label>

              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(
                    e.target.value as Difficulty,
                  )
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
                min={1}
                max={1000}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(
                    Number(e.target.value),
                  )
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
              onChange={(e) =>
                field.handleChange(e.target.checked)
              }
              className="size-4 rounded border-input"
            />

            Make this problem public (usable by other companies)
          </label>
        )}
      </form.Field>

      {problemType === "MCQ" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <Label>MCQ options</Label>

            <select
              value={mcqType}
              onChange={(e) =>
                setMcqType(e.target.value as McqType)
              }
              className="h-9 rounded-md border border-input bg-background px-2 text-xs"
            >
              <option value="SINGLE_CHOICE">
                Single choice
              </option>
              <option value="MULTIPLE_CHOICE">
                Multiple choice
              </option>
            </select>
          </div>

          {options.map((option, index) => (
            <div
              key={option._key}
              className="flex items-center gap-2"
            >
              <input
                type={
                  mcqType === "SINGLE_CHOICE"
                    ? "radio"
                    : "checkbox"
                }
                name="correct-option"
                checked={option.isCorrect}
                onChange={(e) => {
                  if (mcqType === "SINGLE_CHOICE") {
                    setOptions((prev) =>
                      prev.map(
                        (currentOption, currentIndex) => ({
                          ...currentOption,
                          isCorrect:
                            currentIndex === index,
                        }),
                      ),
                    );
                  } else {
                    updateOption(index, {
                      isCorrect: e.target.checked,
                    });
                  }
                }}
                className="size-4 shrink-0"
                aria-label={`Mark option ${index + 1} correct`}
              />

              <Input
                value={option.optionText}
                onChange={(e) =>
                  updateOption(index, {
                    optionText: e.target.value,
                  })
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />

              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="interactive rounded-md p-2 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                aria-label={`Remove option ${index + 1}`}
              >
                <Trash2
                  className="size-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={options.length >= 10}
            className="self-start"
          >
            <Plus
              className="size-3.5"
              aria-hidden="true"
            />
            Add option
          </Button>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="explanation">
              Explanation (optional)
            </Label>

            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) =>
                setExplanation(e.target.value)
              }
              rows={2}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Why is the correct answer correct?"
            />
          </div>
        </div>
      ) : null}

      {problemType === "CODING" ? (
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
          <form.Field name="timeLimitSeconds">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>
                  Time limit (seconds)
                </Label>

                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  max={7200}
                  value={field.state.value}
                  onChange={(e) =>
                    field.handleChange(
                      Number(e.target.value),
                    )
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
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Input
                  </Label>

                  <textarea
                    value={testCase.input ?? ""}
                    onChange={(e) =>
                      updateTestCase(index, {
                        input: e.target.value,
                      })
                    }
                    rows={2}
                    className="interactive w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">
                    Expected output
                  </Label>

                  <textarea
                    value={testCase.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(index, {
                        expectedOutput: e.target.value,
                      })
                    }
                    rows={2}
                    className="interactive w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
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

                  Sample (visible to candidate)
                </label>

                <Input
                  type="number"
                  value={testCase.points ?? ""}
                  onChange={(e) =>
                    updateTestCase(index, {
                      points: Number(e.target.value),
                    })
                  }
                  placeholder="Points"
                  className="h-8 w-24 text-xs"
                />

                <button
                  type="button"
                  onClick={() => removeTestCase(index)}
                  disabled={testCases.length <= 1}
                  className="interactive ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                  aria-label={`Remove test case ${index + 1}`}
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="self-start"
          >
            Create problem
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
