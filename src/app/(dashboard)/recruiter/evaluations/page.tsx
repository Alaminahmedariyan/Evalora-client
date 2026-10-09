"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ClipboardCheck } from "lucide-react";

import { useAssessments } from "@/hooks";
import { AssessmentStatusBadge } from "@/components/module/assessment";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumCard } from "@/components/ui/premium-card";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 50;

const SKELETON_ITEMS = ["evaluation-skeleton-1", "evaluation-skeleton-2", "evaluation-skeleton-3", "evaluation-skeleton-4"];

export default function EvaluationsLandingPage() {
  const router = useRouter();

  const { data, isPending, isError } = useAssessments({
    page: 1,
    limit: PAGE_SIZE,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const assessments = (data?.data ?? []).filter((assessment) => assessment.status !== "DRAFT");
  const hiddenCount = Math.max(0, (data?.meta?.total ?? 0) - PAGE_SIZE);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Evaluations</h1>

        <p className="text-sm text-muted-foreground">
          Coding and written answers are graded per assessment. Open one to see its grading queue.
        </p>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-3">
          {SKELETON_ITEMS.map((id) => (
            <Skeleton key={id} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your assessments. Try refreshing the page.
        </div>
      ) : assessments.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Nothing to grade yet"
          description="Once you publish an assessment and candidates submit their attempts, it will appear here."
          action={{ label: "Go to assessments", onClick: () => router.push("/recruiter/assessments") }}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {assessments.map((assessment) => (
              <li key={assessment.id}>
                <Link href={`/recruiter/assessments/${assessment.id}`} className="block">
                  <PremiumCard className="flex items-center gap-4 p-4">
                    <span className="icon-tile">
                      <ClipboardCheck className="size-5" aria-hidden="true" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{assessment.title}</p>

                      <p className="text-xs text-muted-foreground">
                        {assessment.durationMinutes} min · {assessment.totalMarks} marks · open the grading queue
                      </p>
                    </div>

                    <AssessmentStatusBadge status={assessment.status} />

                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </PremiumCard>
                </Link>
              </li>
            ))}
          </ul>

          {hiddenCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              Showing your {PAGE_SIZE} most recent assessments.{" "}
              <Link href="/recruiter/assessments" className="text-primary hover:underline">
                See all assessments
              </Link>
              .
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}