"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { AttemptDetail, AttemptProblem, SaveSubmissionPayload } from "@/types";
import { useSubmitAttempt } from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AttemptTimer } from "./AttemptTimer";
import { FullscreenGate } from "./FullscreenGate";
import { QuestionNav } from "./QuestionNav";
import { McqAnswerInput } from "./McqAnswerInput";
import { CodingAnswerInput } from "./CodingAnswerInput";
import { WrittenAnswerInput } from "./WrittenAnswerInput";
import { useAttemptAutosave } from "./useAttemptAutosave";
import { useProctoring } from "./useProctoring";

type LocalAnswer = {
  selectedOptionIds?: string[];
  code?: string;
  language?: string;
  answerText?: string;
};

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

// Seeded so the shuffled order is the same on every reload of one attempt,
// but different between attempts.
function seededRandom(seed: string) {
  let hash = 1779033703 ^ seed.length;

  for (let i = 0; i < seed.length; i += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  let state = hash >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], seed: string): T[] {
  const random = seededRandom(seed);
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }

  return copy;
}

// Only the field that belongs to the problem's type is sent. The backend
// treats an empty value as "clear my answer".
function buildPayload(problem: AttemptProblem, answer: LocalAnswer): SaveSubmissionPayload {
  if (problem.type === "MCQ") {
    return { selectedOptionIds: answer.selectedOptionIds ?? [] };
  }

  if (problem.type === "CODING") {
    return { code: answer.code ?? "", language: answer.language ?? "javascript" };
  }

  return { answerText: answer.answerText ?? "" };
}

export function AttemptRunner({ attempt }: { attempt: AttemptDetail }) {
  const router = useRouter();
  const isActive = attempt.status === "IN_PROGRESS";
  const resultsPath = `/candidate/results/${attempt.id}`;

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>(() => buildInitialAnswers(attempt));
  const [tabSwitchCount, setTabSwitchCount] = useState(attempt.tabSwitchCount);
  const [submitting, setSubmitting] = useState(false);

  const answersRef = useRef(answers);
  const submitKeyRef = useRef(newIdempotencyKey());
  const submittingRef = useRef(false);
  const endedRef = useRef(false);

  const submitMutation = useSubmitAttempt(attempt.id);

  // The server says the attempt is over (time ran out, or it was submitted
  // elsewhere): nothing more can be saved, so show the result page.
  const handleEnded = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;

    notify.info("This attempt has ended", "Your answers have been submitted.");
    router.push(resultsPath);
  }, [router, resultsPath]);

  const { queueSave, flush, status } = useAttemptAutosave(attempt.id, handleEnded);

  useProctoring(attempt.id, isActive, () => setTabSwitchCount((c) => c + 1));

  // Save immediately when the candidate leaves the tab, so nothing typed
  // in the last second is lost.
  useEffect(() => {
    if (!isActive) return;

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") void flush();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [isActive, flush]);

  // Closing or refreshing the page with unsaved answers asks for confirmation.
  useEffect(() => {
    if (!isActive || status === "saved") return;

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActive, status]);

  const { shuffleQuestions, allowReview } = attempt.assessment;

  const problems = useMemo(
    () =>
      shuffleQuestions
        ? shuffled(attempt.assessment.assessmentProblems, attempt.id)
        : attempt.assessment.assessmentProblems,
    [shuffleQuestions, attempt.assessment.assessmentProblems, attempt.id],
  );

  function goTo(index: number) {
    // With review turned off, a candidate can only move forward.
    if (!allowReview && index < activeIndex) return;
    setActiveIndex(index);
  }

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

  function updateAnswer(problem: AttemptProblem, patch: LocalAnswer) {
    const merged = { ...answersRef.current[problem.id], ...patch };

    answersRef.current = { ...answersRef.current, [problem.id]: merged };
    setAnswers(answersRef.current);
    queueSave(problem.id, buildPayload(problem, merged));
  }

  async function handleSubmit(auto = false) {
    if (submittingRef.current) return;

    if (
      !auto &&
      !window.confirm("Submit this attempt? You won't be able to change your answers afterward.")
    ) {
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    try {
      // Send any answer still waiting for its autosave before closing the attempt.
      const allSaved = await flush();

      if (
        !allSaved &&
        !auto &&
        !window.confirm("Some of your latest answers couldn't be saved. Submit anyway?")
      ) {
        return;
      }

      await submitMutation.mutateAsync(submitKeyRef.current);

      endedRef.current = true;
      notify.success(auto ? "Time's up — attempt submitted automatically" : "Attempt submitted");
      router.push(resultsPath);
    } catch (error) {
      if (isApiError(error)) {
        // The server answered, so this try is settled: the next one is a new
        // action and needs a new key. Only a network failure or a 5xx keeps
        // the key, which keeps the retry safe against a double submission.
        if (error.statusCode < 500) submitKeyRef.current = newIdempotencyKey();

        // Already submitted (for example by the timer): go to the result.
        if (error.statusCode === 409 && !endedRef.current) {
          endedRef.current = true;
          router.push(resultsPath);
          return;
        }
      }

      notify.error("Couldn't submit", isApiError(error) ? error.message : undefined);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (!current) return null;

  const { problem } = current;
  const answer = answers[problem.id] ?? {};

  return (
    <div className="flex flex-1 flex-col">
      <FullscreenGate active={isActive} />

      <div className="flex items-center justify-between border-b border-border px-4 py-2 md:px-6">
        <div>
          <p className="text-sm font-semibold">{attempt.assessment.title}</p>

          <p className="text-xs text-muted-foreground">
            Question {activeIndex + 1} of {problems.length}
            {tabSwitchCount > 0 ? (
              <span className="proctor-warning ml-2 rounded-full border px-1.5 py-0.5">
                {tabSwitchCount} tab switch{tabSwitchCount === 1 ? "" : "es"}
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <p
            aria-live="polite"
            className={cn(
              "hidden text-xs sm:block",
              status === "error" ? "text-danger" : "text-muted-foreground",
            )}
          >
            {status === "saving"
              ? "Saving…"
              : status === "error"
                ? "Not saved yet — retrying"
                : "All changes saved"}
          </p>

          <AttemptTimer expiresAt={attempt.expiresAt} onExpire={() => void handleSubmit(true)} />

          <Button
            size="sm"
            variant="destructive"
            onClick={() => void handleSubmit(false)}
            isLoading={submitting}
          >
            Submit attempt
          </Button>
        </div>
      </div>

      <div className="border-b border-border px-4 py-3 md:px-6">
        <QuestionNav
          problems={problems}
          answeredProblemIds={answeredProblemIds}
          activeIndex={activeIndex}
          onSelect={goTo}
        />

        {!allowReview ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Review is turned off for this assessment: you can&apos;t go back to earlier questions.
          </p>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 md:px-6">
        <div>
          <h1 className="text-lg font-semibold">{problem.title}</h1>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {problem.description}
          </p>
        </div>

        {problem.type === "MCQ" ? (
          <McqAnswerInput
            problem={problem}
            selected={answer.selectedOptionIds ?? []}
            onChange={(next) => updateAnswer(problem, { selectedOptionIds: next })}
          />
        ) : problem.type === "CODING" ? (
          <CodingAnswerInput
            code={answer.code ?? ""}
            language={answer.language ?? "javascript"}
            onCodeChange={(code) => updateAnswer(problem, { code })}
            onLanguageChange={(language) => updateAnswer(problem, { language })}
            sampleTestCases={problem.testCases}
          />
        ) : (
          <WrittenAnswerInput
            value={answer.answerText ?? ""}
            onChange={(answerText) => updateAnswer(problem, { answerText })}
          />
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!allowReview || activeIndex === 0}
            onClick={() => setActiveIndex((i) => i - 1)}
          >
            Previous
          </Button>

          <Button
            size="sm"
            disabled={activeIndex === problems.length - 1}
            onClick={() => setActiveIndex((i) => i + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
