"use client";

import { useParams } from "next/navigation";

import { ResultCard } from "@/components/module/result";

export default function CandidateResultDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Your result</h1>
      <ResultCard attemptId={attemptId} />
    </div>
  );
}