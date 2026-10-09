"use client";

import { useEffect, useState } from "react";
import {
  Award,
  CalendarCheck,
  Hourglass,
  Lock,
  Percent,
  RefreshCw,
  Target,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import type { Result } from "@/types";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/apiClient";
import { celebrate } from "@/lib/confetti";
import { cn } from "@/lib/utils";
import { useResultByAttempt } from "@/hooks";
import { ResultStatusBadge } from "./ResultStatusBadge";

const RING_SIZE = 176;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const THEME = {
  PASSED: {
    ring: "stroke-emerald-500",
    bar: "bg-emerald-500",
    glow: "from-emerald-500/20",
    heading: "You passed",
  },
  FAILED: {
    ring: "stroke-rose-500",
    bar: "bg-rose-500",
    glow: "from-rose-500/20",
    heading: "Not passed this time",
  },
  PENDING: {
    ring: "stroke-amber-500",
    bar: "bg-amber-500",
    glow: "from-amber-500/20",
    heading: "Grading in progress",
  },
} as const;

const TONES = {
  locked: "bg-primary/10 text-primary",
  pending: "bg-amber-500/10 text-amber-500",
  error: "bg-rose-500/10 text-rose-500",
} as const;

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function StateCard({
  icon: Icon,
  tone,
  title,
  description,
  detail,
  onRetry,
  retrying,
}: {
  icon: LucideIcon;
  tone: keyof typeof TONES;
  title: string;
  description: string;
  detail?: string | undefined;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  return (
    <PremiumCard
      interactive={false}
      className="flex flex-col items-center gap-4 px-6 py-14 text-center"
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          TONES[tone],
        )}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        {detail ? (
          <p className="mt-1 text-xs text-muted-foreground/80">{detail}</p>
        ) : null}
      </div>

      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          isLoading={retrying ?? false}
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Check again
        </Button>
      ) : null}
    </PremiumCard>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-background/60 p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="stat-number text-lg font-semibold">{value}</span>
    </div>
  );
}

function ResultDetails({ result }: { result: Result }) {
  // The ring and bar start empty and fill in after the first paint.
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Confetti once per result per browser session, never on every revisit.
  useEffect(() => {
    if (result.status !== "PASSED") return;

    const key = `evalora-celebrated-${result.id}`;

    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Storage can be blocked; celebrating once more is harmless.
    }

    celebrate();
  }, [result.id, result.status]);

  const theme = THEME[result.status];
  const percentage = Math.min(100, Math.max(0, Number(result.percentage) || 0));
  const displayPercentage = Math.round(percentage * 10) / 10;
  const dashOffset = RING_CIRCUMFERENCE * (1 - percentage / 100);

  const passingMarks = result.assessment?.passingMarks;
  const passPercent =
    passingMarks !== undefined && result.totalMarks > 0
      ? Math.min(100, (passingMarks / result.totalMarks) * 100)
      : null;
  const margin =
    passingMarks !== undefined ? result.totalScore - passingMarks : null;

  let verdict: string;

  if (result.status === "PENDING") {
    verdict =
      "Some answers are still being reviewed. Your final score may change.";
  } else if (margin === null) {
    verdict =
      result.status === "PASSED"
        ? "Congratulations, you passed!"
        : "Keep practising, you'll get there.";
  } else if (result.status === "PASSED") {
    verdict =
      margin === 0
        ? "You met the pass mark exactly."
        : `You finished ${plural(margin, "mark")} above the pass mark.`;
  } else {
    verdict = `You needed ${plural(Math.abs(margin), "more mark")} to pass.`;
  }

  return (
    <PremiumCard
      interactive={false}
      variant={result.status === "PASSED" ? "highlight" : "default"}
      className="overflow-hidden"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-60 bg-gradient-to-b to-transparent",
          theme.glow,
        )}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-7 px-6 pb-8 pt-8 sm:px-10">
        <div className="flex w-full flex-col items-center gap-3 text-center">
          <ResultStatusBadge status={result.status} />
          {result.assessment ? (
            <p className="text-sm font-medium text-muted-foreground">
              {result.assessment.title}
            </p>
          ) : null}
        </div>

        <div
          className="relative"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              className="stroke-muted"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              strokeWidth={RING_STROKE}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={animated ? dashOffset : RING_CIRCUMFERENCE}
              className={cn(
                theme.ring,
                "transition-[stroke-dashoffset] duration-1000 ease-out",
              )}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="stat-number text-4xl font-bold leading-none">
              {result.totalScore}
            </span>
            <span className="mt-1.5 text-sm text-muted-foreground">
              out of {result.totalMarks}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-xl font-semibold">{theme.heading}</h2>
          <p className="max-w-md text-sm text-muted-foreground">{verdict}</p>
        </div>

        {passPercent !== null && passingMarks !== undefined ? (
          <div className="w-full">
            <div className="relative h-2.5 w-full rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-[width] duration-1000 ease-out",
                  theme.bar,
                )}
                style={{ width: `${animated ? percentage : 0}%` }}
              />
              <span
                className="absolute top-[-4px] h-[18px] w-0.5 rounded-full bg-foreground/70"
                style={{ left: `${passPercent}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>
                Pass mark {passingMarks}/{result.totalMarks}
              </span>
              <span>100%</span>
            </div>
          </div>
        ) : null}

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat
            icon={Percent}
            label="Percentage"
            value={`${displayPercentage}%`}
          />
          <Stat
            icon={Target}
            label="Score"
            value={`${result.totalScore}/${result.totalMarks}`}
          />
          <Stat
            icon={Award}
            label="Rank"
            value={result.rank ? `#${result.rank}` : "—"}
          />
        </div>

        <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Attempt #{result.attempt.attemptNumber}</span>
          {result.evaluatedAt ? (
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-3.5" aria-hidden="true" />
              Graded on {new Date(result.evaluatedAt).toLocaleDateString()}
            </span>
          ) : null}
        </p>
      </div>
    </PremiumCard>
  );
}

export function ResultCard({ attemptId }: { attemptId: string }) {
  const { data, isPending, isError, error, refetch, isFetching } =
    useResultByAttempt(attemptId);

  if (isPending) {
    return <Skeleton className="h-[34rem] w-full rounded-2xl" />;
  }

  if (isError) {
    const statusCode = isApiError(error) ? error.statusCode : undefined;

    // 403: the result exists but the recruiter hasn't released it yet.
    if (statusCode === 403) {
      return (
        <StateCard
          icon={Lock}
          tone="locked"
          title="Results aren't released yet"
          description="Your recruiter releases results once the assessment closes. You'll get a notification as soon as yours is ready."
        />
      );
    }

    // 404: the attempt isn't finalized or fully graded yet.
    if (statusCode === 404) {
      return (
        <StateCard
          icon={Hourglass}
          tone="pending"
          title="Grading in progress"
          description="Your result will appear here as soon as grading is complete."
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      );
    }

    return (
      <StateCard
        icon={TriangleAlert}
        tone="error"
        title="Couldn't load your result"
        description="Something went wrong on our side. Please try again."
        detail={isApiError(error) ? error.message : undefined}
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  if (!data?.data) {
    return (
      <StateCard
        icon={Hourglass}
        tone="pending"
        title="Grading in progress"
        description="Your result will appear here as soon as grading is complete."
        onRetry={() => void refetch()}
        retrying={isFetching}
      />
    );
  }

  return <ResultDetails result={data.data} />;
}