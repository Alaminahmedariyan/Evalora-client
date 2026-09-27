"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AttemptDetail } from "@/types";
import { useSaveSubmission, useSubmitAttempt } from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { AttemptTimer } from "./AttemptTimer";
import { QuestionNav } from "./QuestionNav";
import { McqAnswerInput } from "./McqAnswerInput";
import { CodingAnswerInput } from "./CodingAnswerInput";
import { WrittenAnswerInput } from "./WrittenAnswerInput";
import { useProctoring } from "./useProctoring";

type LocalAnswer = { selectedOptionIds?: string[]; code?: string; language?: string; answerText?: string };

function buildInitialAnswers(attempt: AttemptDetail): Record<string, LocalAnswer> {
  const map: Record<string, LocalAnswer> = {};
  for (const submission of attempt.submissions) {
    map[submission.problemId] = {
      selectedOptionIds: submission.answers.map((a) => a.optionId),
      code: submission.code ?? undefined,
      language: submission.language ?? undefined,
      answerText: submission.answerText ?? undefined,
    };
  }
  return map;
}

export function AttemptRunner({ attempt }: { attempt: AttemptDetail }) {
  const router = useRouter();
  const isActive = attempt.status === "IN_PROGRESS";

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>(() => buildInitialAnswers(attempt));
  const [tabSwitchCount, setTabSwitchCount] = useState(attempt.tabSwitchCount);
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const saveMutation = useSaveSubmission(attempt.id);
  const submitMutation = useSubmitAttempt(attempt.id);

  useProctoring(attempt.id, isActive, () => setTabSwitchCount((c) => c + 1));

  const problems = attempt.assessment.assessmentProblems;
  const current = problems[activeIndex];

  const answeredProblemIds = useMemo(() => {
    const ids = new Set<string>();
    for (const [problemId, answer] of Object.entries(answers)) {
      if (answer.selectedOptionIds?.length || answer.code?.trim() || answer.answerText?.trim()) {
        ids.add(problemId);
      }
    }
    return ids;
  }, [answers]);

  const scheduleSave = useCallback(
    (problemId: string, payload: LocalAnswer) => {
      if (saveTimers.current[problemId]) clearTimeout(saveTimers.current[problemId]);
      saveTimers.current[problemId] = setTimeout(() => {
        saveMutation.mutate(
          { problemId, payload },
          {
            onError: (error) => {
              notify.error("Couldn't save your answer", isApiError(error) ? error.message : "Check your connection.");
            },
          },
        );
      }, 800); // debounce — don't fire a save on every keystroke
    },
    [saveMutation],
  );

  function updateAnswer(problemId: string, patch: LocalAnswer) {
    setAnswers((prev) => {
      const next = { ...prev, [problemId]: { ...prev[problemId], ...patch } };
      scheduleSave(problemId, next[problemId]!);
      return next;
    });
  }

  async function handleSubmit(auto = false) {
    if (!auto && !window.confirm("Submit this attempt? You won't be able to change your answers afterward.")) return;

    try {
      await submitMutation.mutateAsync();
      notify.success(auto ? "Time's up — attempt submitted automatically" : "Attempt submitted");
      router.push(`/candidate/results/${attempt.id}`);
    } catch (error) {
      notify.error("Couldn't submit", isApiError(error) ? error.message : undefined);
    }
  }

  if (!current) return null;

  const { problem } = current;
  const answer = answers[problem.id] ?? {};

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 md:px-6">
        <div>
          <p className="text-sm font-semibold">{attempt.assessment.title}</p>
          <p className="text-xs text-muted-foreground">
            Question {activeIndex + 1} of {problems.length}
            {tabSwitchCount > 0 ? (
              <span className="proctor-warning ml-2 rounded-full border px-1.5 py-0.5">{tabSwitchCount} tab switch{tabSwitchCount === 1 ? "" : "es"}</span>
            ) : null}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AttemptTimer expiresAt={attempt.expiresAt} onExpire={() => void handleSubmit(true)} />
          <Button size="sm" variant="destructive" onClick={() => void handleSubmit(false)} isLoading={submitMutation.isPending}>
            Submit attempt
          </Button>
        </div>
      </div>

      <div className="border-b border-border px-4 py-3 md:px-6">
        <QuestionNav problems={problems} answeredProblemIds={answeredProblemIds} activeIndex={activeIndex} onSelect={setActiveIndex} />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 md:px-6">
        <div>
          <h1 className="text-lg font-semibold">{problem.title}</h1>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{problem.description}</p>
        </div>

        {problem.type === "MCQ" ? (
          <McqAnswerInput
            problem={problem}
            selected={answer.selectedOptionIds ?? []}
            onChange={(next) => updateAnswer(problem.id, { selectedOptionIds: next })}
          />
        ) : problem.type === "CODING" ? (
          <CodingAnswerInput
            code={answer.code ?? ""}
            language={answer.language ?? "javascript"}
            onCodeChange={(code) => updateAnswer(problem.id, { code })}
            onLanguageChange={(language) => updateAnswer(problem.id, { language })}
            sampleTestCases={problem.testCases}
          />
        ) : (
          <WrittenAnswerInput value={answer.answerText ?? ""} onChange={(answerText) => updateAnswer(problem.id, { answerText })} />
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" disabled={activeIndex === 0} onClick={() => setActiveIndex((i) => i - 1)}>
            Previous
          </Button>
          <Button size="sm" disabled={activeIndex === problems.length - 1} onClick={() => setActiveIndex((i) => i + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}