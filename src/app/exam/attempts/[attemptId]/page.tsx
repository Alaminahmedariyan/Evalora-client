"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { CheckCircle2, Clock3, Hourglass, XCircle, type LucideIcon } from "lucide-react";

import type { AttemptStatus } from "@/types";
import { useAttempt } from "@/hooks";
import { AttemptRunner } from "@/components/module/attempt";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type EndedStatus = Exclude<AttemptStatus, "IN_PROGRESS">;

const ENDED: Record<EndedStatus, { icon: LucideIcon; title: string; description: string }> = {
  NOT_STARTED: {
    icon: Hourglass,
    title: "This attempt hasn't started",
    description: "Start the assessment from your invitations page.",
  },
  SUBMITTED: {
    icon: CheckCircle2,
    title: "Attempt submitted",
    description: "Your answers were submitted. Your result will appear once grading is complete.",
  },
  AUTO_SUBMITTED: {
    icon: Clock3,
    title: "Submitted automatically",
    description: "Time ran out, so your answers were submitted for you.",
  },
  EVALUATED: {
    icon: CheckCircle2,
    title: "Attempt completed",
    description: "This attempt has been graded.",
  },
  EXPIRED: {
    icon: XCircle,
    title: "This attempt expired",
    description: "The time for this attempt ran out before it was submitted.",
  },
};

const HAS_RESULT: EndedStatus[] = ["SUBMITTED", "AUTO_SUBMITTED", "EVALUATED"];

export default function ExamAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data, isPending, isError } = useAttempt(attemptId);

  if (isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <p className="text-center text-sm text-muted-foreground">Loading your attempt...</p>
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const attempt = data.data;

  if (attempt.status !== "IN_PROGRESS") {
    const info = ENDED[attempt.status];
    const Icon = info.icon;
    const hasResult = HAS_RESULT.includes(attempt.status);

    return (
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="card-evalora flex w-full max-w-md flex-col items-center gap-4 px-6 py-10 text-center">
          <span className="icon-tile size-14">
            <Icon className="size-6" aria-hidden="true" />
          </span>

          <div className="flex flex-col gap-1.5">
            <h1 className="text-lg font-semibold">{info.title}</h1>
            <p className="text-sm text-muted-foreground">{info.description}</p>
          </div>

          <Button asChild>
            <Link href={hasResult ? `/candidate/results/${attempt.id}` : "/candidate/invitations"}>
              {hasResult ? "View your result" : "Back to invitations"}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <AttemptRunner attempt={attempt} />;
}