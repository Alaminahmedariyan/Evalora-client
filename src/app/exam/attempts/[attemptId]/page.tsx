"use client";

import { notFound, useParams } from "next/navigation";

import { useAttempt } from "@/hooks";
import { AttemptRunner } from "@/components/module/attempt";

export default function ExamAttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { data, isPending, isError } = useAttempt(attemptId);

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Loading your attempt...
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const attempt = data.data;

  if (attempt.status !== "IN_PROGRESS") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">This attempt is already {attempt.status.toLowerCase().replace("_", " ")}.</p>
        <a href={`/candidate/results/${attempt.id}`} className="text-sm text-primary hover:underline">
          View your result
        </a>
      </div>
    );
  }

  return <AttemptRunner attempt={attempt} />;
}