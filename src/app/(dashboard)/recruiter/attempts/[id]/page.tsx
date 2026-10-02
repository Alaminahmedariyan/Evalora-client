"use client";

import { notFound, useParams } from "next/navigation";

import { useAttempt } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { AttemptSummaryCard, ProctoringTimeline } from "@/components/module/attempt";

export default function RecruiterAttemptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useAttempt(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const attempt = data.data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{attempt.assessment.title}</h1>
        <p className="text-sm text-muted-foreground">Attempt detail and proctoring activity.</p>
      </div>

      <AttemptSummaryCard attempt={attempt} />

      <div>
        <h2 className="mb-3 text-sm font-semibold">Proctoring timeline</h2>
        <ProctoringTimeline attemptId={attempt.id} />
      </div>
    </div>
  );
}