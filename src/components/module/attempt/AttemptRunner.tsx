"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CloudOff,
  Flag,
  Info,
  Loader,
  Send,
  X,
} from "lucide-react";

import type { AttemptDetail, AttemptProblem, SaveSubmissionPayload } from "@/types";
import { useSubmitAttempt } from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Progress } from "@/components/ui/progress";
import { DifficultyBadge } from "@/components/module/problem/DifficultyBadge";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { AttemptTimer } from "./AttemptTimer";
import { FullscreenGate } from "./FullscreenGate";
import { QuestionNav } from "./QuestionNav";
import { McqAnswerInput } from "./McqAnswerInput";
import { CodingAnswerInput } from "./CodingAnswerInput";
import { WrittenAnswerInput } from "./WrittenAnswerInput";
import { type SaveStatus, useAttemptAutosave } from "./useAttemptAutosave";
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

// "Marked for review" lives only in this browser tab (no schema, no API), so a
// refresh keeps it but it never reaches the recruiter.
const flagKey = (attemptId: string) => `evalora-flagged-${attemptId}`;

function readFlagged(attemptId: string): Set<string> {
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.sessionStorage.getItem(flagKey(attemptId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return new Set(
      Array.isArray(parsed)
        ? parsed.filter((value): value is string => typeof value === "string")
        : [],
    );
  } catch {
    return new Set();
  }
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
        <Loader className="size-3.5" aria-hidden="true" />
        Saving…
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-danger sm:inline-flex">
        <CloudOff className="size-3.5" aria-hidden="true" />
        Not saved, retrying
      </span>
    );
  }

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
      <Check className="size-3.5 text-success" aria-hidden="true" />
      Saved
    </span>
  );
}

function SummaryStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3 text-center">
      <p className={cn("stat-number text-xl font-semibold", className)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AttemptRunner({ attempt }: { attempt: AttemptDetail }) {
  const router = useRouter();
  const isActive = attempt.status === "IN_PROGRESS";
  const resultsPath = `/candidate/results/${attempt.id}`;
  const instructions = attempt.assessment.instructions?.trim() ?? "";

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, LocalAnswer>>(() => buildInitialAnswers(attempt));
  const [tabSwitchCount, setTabSwitchCount] = useState(attempt.tabSwitchCount);
  const [submitting, setSubmitting] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(instructions.length > 0);
  const [flagged, setFlagged] = useState<Set<string>>(() => readFlagged(attempt.id));

  const answersRef = useRef(answers);
  const submitKeyRef = useRef(newIdempotencyKey());
  const submittingRef = useRef(false);
  const endedRef = useRef(false);
  const unsavedResolverRef = useRef<((ok: boolean) => void) | null>(null);

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

  useEffect(() => {
    try {
      window.sessionStorage.setItem(flagKey(attempt.id), JSON.stringify([...flagged]));
    } catch {
      // Storage can be blocked; the flags just won't survive a refresh.
    }
  }, [flagged, attempt.id]);

  const { shuffleQuestions, allowReview, showResultImmediately } = attempt.assessment;

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

  const total = problems.length;
  const answeredCount = problems.filter((ap) => answeredProblemIds.has(ap.problem.id)).length;
  const unansweredCount = total - answeredCount;
  const flaggedCount = problems.filter((ap) => flagged.has(ap.problem.id)).length;
  const progress = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  function updateAnswer(problem: AttemptProblem, patch: LocalAnswer) {
    const merged = { ...answersRef.current[problem.id], ...patch };

    answersRef.current = { ...answersRef.current, [problem.id]: merged };
    setAnswers(answersRef.current);
    queueSave(problem.id, buildPayload(problem, merged));
  }

  function toggleFlag(problemId: string) {
    setFlagged((previous) => {
      const next = new Set(previous);

      if (next.has(problemId)) next.delete(problemId);
      else next.add(problemId);

      return next;
    });
  }

  // Resolves with the candidate's choice when some answers could not be saved.
  function askUnsaved(): Promise<boolean> {
    return new Promise((resolve) => {
      unsavedResolverRef.current = resolve;
      setUnsavedOpen(true);
    });
  }

  function resolveUnsaved(ok: boolean) {
    const resolve = unsavedResolverRef.current;

    unsavedResolverRef.current = null;
    setUnsavedOpen(false);
    resolve?.(ok);
  }

  async function handleSubmit(auto = false) {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitOpen(false);

    try {
      // Send any answer still waiting for its autosave before closing the attempt.
      const allSaved = await flush();

      if (!allSaved && !auto && !(await askUnsaved())) return;

      await submitMutation.mutateAsync(submitKeyRef.current);

      endedRef.current = true;
      notify.success(
        auto ? "Time's up, attempt submitted automatically" : "Attempt submitted",
        showResultImmediately
          ? undefined
          : "Your result will be available once the recruiter releases results.",
      );
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

  // The timer calls this once when time runs out. It always reaches the
  // latest handleSubmit without restarting the timer on every render.
  const submitRef = useRef(handleSubmit);

  useEffect(() => {
    submitRef.current = handleSubmit;
  });

  const handleExpire = useCallback(() => void submitRef.current(true), []);

  if (!current) return null;

  const { problem } = current;
  const answer = answers[problem.id] ?? {};
  const isLast = activeIndex === total - 1;
  const isFlagged = flagged.has(problem.id);
  const isAnswered = answeredProblemIds.has(problem.id);

  return (
    <div className="flex flex-1 flex-col">
      <FullscreenGate active={isActive} />

      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{attempt.assessment.title}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Progress value={progress} className="h-1.5 w-28 sm:w-40" />
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{total} answered
              </span>

              {tabSwitchCount > 0 ? (
                <span className="proctor-warning rounded-full border px-1.5 py-0.5 text-xs">
                  {tabSwitchCount} tab switch{tabSwitchCount === 1 ? "" : "es"}
                </span>
              ) : null}
            </div>
          </div>

          <div aria-live="polite">
            <SaveIndicator status={status} />
          </div>

          {instructions && !showInstructions ? (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              onClick={() => setShowInstructions(true)}
            >
              <Info className="size-3.5" aria-hidden="true" />
              Instructions
            </Button>
          ) : null}

          <AttemptTimer expiresAt={attempt.expiresAt} onExpire={handleExpire} />

          <Button size="sm" onClick={() => setSubmitOpen(true)} isLoading={submitting}>
            <Send className="size-3.5" aria-hidden="true" />
            Submit
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="card-evalora p-4 lg:hidden">
            <QuestionNav
              problems={problems}
              answeredProblemIds={answeredProblemIds}
              flaggedProblemIds={flagged}
              activeIndex={activeIndex}
              onSelect={goTo}
            />
          </div>

          {showInstructions && instructions ? (
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Instructions from the recruiter</p>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{instructions}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInstructions(false)}
                  className="interactive rounded-md p-1 text-muted-foreground hover:bg-accent"
                  aria-label="Dismiss instructions"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="card-evalora flex flex-col gap-5 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Question {activeIndex + 1} of {total}
              </span>
              <ProblemTypeBadge type={problem.type} />
              <DifficultyBadge difficulty={problem.difficulty} />

              <span className="stat-number ml-auto text-xs font-medium text-muted-foreground">
                {current.marks} mark{current.marks === 1 ? "" : "s"}
              </span>
            </div>

            <div>
              <h1 className="text-xl font-semibold leading-snug">{problem.title}</h1>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>

            <div className="border-t border-border pt-5">
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
            </div>

            <p
              className={cn(
                "text-xs",
                isAnswered ? "text-success" : "text-muted-foreground",
              )}
            >
              {isAnswered ? "Answered" : "Not answered yet"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!allowReview || activeIndex === 0}
              onClick={() => setActiveIndex((i) => i - 1)}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </Button>

            {allowReview ? (
              <Button
                variant={isFlagged ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFlag(problem.id)}
                aria-pressed={isFlagged}
              >
                <Flag className="size-3.5" aria-hidden="true" />
                {isFlagged ? "Marked for review" : "Mark for review"}
              </Button>
            ) : null}

            {isLast ? (
              <Button size="sm" onClick={() => setSubmitOpen(true)}>
                Review &amp; submit
              </Button>
            ) : (
              <Button size="sm" onClick={() => setActiveIndex((i) => i + 1)}>
                Next
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>

          {!allowReview ? (
            <p className="text-xs text-muted-foreground">
              Review is turned off for this assessment: you can&apos;t go back to earlier questions.
            </p>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <div className="card-evalora sticky top-24 flex flex-col gap-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Questions</h2>
              <span className="stat-number text-xs text-muted-foreground">
                {answeredCount}/{total}
              </span>
            </div>

            <QuestionNav
              problems={problems}
              answeredProblemIds={answeredProblemIds}
              flaggedProblemIds={flagged}
              activeIndex={activeIndex}
              onSelect={goTo}
            />

            <ul className="flex flex-col gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm border border-primary bg-primary" />
                Current
              </li>
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm border border-success/40 bg-success/10" />
                Answered
              </li>
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm border border-border" />
                Not answered
              </li>
              {allowReview ? (
                <li className="flex items-center gap-2">
                  <Flag className="size-3 text-warning" aria-hidden="true" />
                  Marked for review
                </li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        title="Submit your attempt?"
        description="You won't be able to change your answers after submitting."
        confirmLabel="Submit attempt"
        onConfirm={() => void handleSubmit(false)}
      >
        <div className="grid grid-cols-3 gap-2">
          <SummaryStat label="Answered" value={answeredCount} className="text-success" />
          <SummaryStat label="Not answered" value={unansweredCount} />
          <SummaryStat label="For review" value={flaggedCount} className="text-warning" />
        </div>

        {unansweredCount > 0 ? (
          <p className="text-xs text-warning">
            {unansweredCount} question{unansweredCount === 1 ? " is" : "s are"} still unanswered.
          </p>
        ) : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={unsavedOpen}
        onOpenChange={(open) => {
          if (!open) resolveUnsaved(false);
        }}
        title="Some answers couldn't be saved"
        description="Your latest changes may be lost if you submit now. Submit anyway?"
        confirmLabel="Submit anyway"
        variant="destructive"
        onConfirm={() => resolveUnsaved(true)}
      />
    </div>
  );
}