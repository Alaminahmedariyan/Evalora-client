"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ResultCard } from "@/components/module/result";

export default function CandidateResultDetailPage() {
  const { attemptId } = useParams<{ attemptId: string }>();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-3">
        <Link
          href="/candidate/results"
          className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All results
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Your result</h1>
      </div>

      <ResultCard attemptId={attemptId} />
    </div>
  );
}