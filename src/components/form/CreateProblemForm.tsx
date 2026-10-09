"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { CheckSquare, Code2, FileText, type LucideIcon } from "lucide-react";

import type { CreateProblemPayload, Difficulty, McqOptionInput, McqType, TestCaseInput } from "@/types";
import { useCreateProblem } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { createProblemSchema, baseProblemFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FormSection,
  McqOptionsEditor,
  SELECT_CLASS,
  TEXTAREA_CLASS,
  TestCasesEditor,
  type KeyedOption,
  type KeyedTestCase,
} from "./problem-form-parts";

type ProblemTypeChoice = "MCQ" | "CODING" | "WRITTEN";

const TYPE_CHOICES: {
  value: ProblemTypeChoice;
  label: string;
  description: string;
  icon: LucideIcon;
}[] = [
  { value: "MCQ", label: "MCQ", description: "Pick the right option(s). Graded automatically.", icon: CheckSquare },
  { value: "CODING", label: "Coding", description: "Write a solution. You grade it with test cases.", icon: Code2 },
  { value: "WRITTEN", label: "Written", description: "Free-text answer. You grade it manually.", icon: FileText },
];

const emptyOption = (order: number): KeyedOption => ({
  _key: crypto.randomUUID(),
  optionText: "",
  isCorrect: false,
  order,
});

const emptyTestCase = (): KeyedTestCase => ({
  _key: crypto.randomUUID(),
  expectedOutput: "",
  isSample: false,
});

export function CreateProblemForm() {
  const router = useRouter();
  const createMutation = useCreateProblem();
  const [formError, setFormError] = useState<string | null>(null);

  const [problemType, setProblemType] = useState<ProblemTypeChoice>("MCQ");
  const [mcqType, setMcqType] = useState<McqType>("SINGLE_CHOICE");
  const [explanation, setExplanation] = useState("");
  const [options, setOptions] = useState<KeyedOption[]>([emptyOption(1), emptyOption(2)]);
  const [testCases, setTestCases] = useState<KeyedTestCase[]>([emptyTestCase()]);

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

      const cleanOptions: McqOptionInput[] = options.map(({ _key, ...option }) => option);
      const cleanTestCases: TestCaseInput[] = testCases.map(({ _key, ...testCase }) => testCase);

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
        payload = { ...base, type: "WRITTEN" };
      }

      const parsed = createProblemSchema.safeParse(payload);

      if (!parsed.success) {
        setFormError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
        return;
      }

      try {
        await createMutation.mutateAsync(payload);

        celebrate();
        notify.success("Problem created!");
        router.push("/recruiter/problems");
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't create the problem.";

        setFormError(message);
        notify.error("Creation failed", message);
      }
    },
  });

  function handleMcqTypeChange(next: McqType) {
    setMcqType(next);

    // Single choice allows exactly one correct answer: keep only the first.
    if (next === "SINGLE_CHOICE") {
      setOptions((previous) => {
        let seen = false;

        return previous.map((option) => {
          if (!option.isCorrect) return option;
          if (!seen) {
            seen = true;
            return option;
          }
          return { ...option, isCorrect: false };
        });
      });
    }
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
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <FormSection title="Question type" description="Choose how candidates will answer.">
        <div className="grid gap-3 sm:grid-cols-3">
          {TYPE_CHOICES.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={problemType === value}
              onClick={() => setProblemType(value)}
              className={cn(
                "interactive flex flex-col items-start gap-2 rounded-xl border p-4 text-left",
                problemType === value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/40 hover:bg-accent",
              )}
            >
              <Icon
                className={cn("size-5", problemType === value ? "text-primary" : "text-muted-foreground")}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs text-muted-foreground">{description}</span>
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Details">
        <form.Field
          name="title"
          validators={{
            onBlur: ({ value }) => baseProblemFields.shape.title.safeParse(value).error?.issues[0]?.message,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Title</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Two Sum"
              />
              {field.state.meta.errors[0] ? (
                <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="description"
          validators={{
            onBlur: ({ value }) => baseProblemFields.shape.description.safeParse(value).error?.issues[0]?.message,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Description</Label>
              <textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                rows={5}
                className={TEXTAREA_CLASS}
                placeholder="Describe the problem candidates will solve..."
              />
              {field.state.meta.errors[0] ? (
                <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p>
              ) : null}
            </div>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="difficulty">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Difficulty</Label>
                <select
                  id={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value as Difficulty)}
                  className={SELECT_CLASS}
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
                <Label htmlFor={field.name}>Default marks</Label>
                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  max={1000}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="isPublic">
          {(field) => (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="mt-0.5 size-4 rounded border-input"
              />
              <span>
                Make this problem public
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Other companies will be able to use it in their assessments.
                </span>
              </span>
            </label>
          )}
        </form.Field>
      </FormSection>

      {problemType === "MCQ" ? (
        <FormSection title="Answer options" description="Add 2 to 10 options and mark the correct ones.">
          <McqOptionsEditor
            options={options}
            mcqType={mcqType}
            onChange={setOptions}
            onMcqTypeChange={handleMcqTypeChange}
            canResize
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="explanation">Explanation (optional)</Label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={2}
              className={TEXTAREA_CLASS}
              placeholder="Why is the correct answer correct? Only you see this."
            />
          </div>
        </FormSection>
      ) : null}

      {problemType === "CODING" ? (
        <FormSection title="Coding setup" description="Candidates write code. You grade it against these test cases.">
          <form.Field name="timeLimitSeconds">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Time limit (seconds)</Label>
                <Input
                  id={field.name}
                  type="number"
                  min={1}
                  max={7200}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="max-w-[160px]"
                />
              </div>
            )}
          </form.Field>

          <TestCasesEditor testCases={testCases} onChange={setTestCases} />
        </FormSection>
      ) : null}

      <div className="flex items-center gap-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" isLoading={isSubmitting}>
              Create problem
            </Button>
          )}
        </form.Subscribe>

        <Button asChild variant="ghost">
          <Link href="/recruiter/problems">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}