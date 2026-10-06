"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import { useAssessments, useDebounce } from "@/hooks";
import type { AssessmentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";

const STATUS_OPTIONS: { value: AssessmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ACTIVE", label: "Active" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

const SKELETON_ITEMS = [
  "assessment-skeleton-1",
  "assessment-skeleton-2",
  "assessment-skeleton-3",
  "assessment-skeleton-4",
  "assessment-skeleton-5",
];

export function AssessmentList() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AssessmentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useAssessments({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: status === "ALL" ? undefined : status,
  });

  const hasFilters = Boolean(debouncedSearch) || status !== "ALL";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search assessments..."
          aria-label="Search assessments"
          className="max-w-xs"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AssessmentStatus | "ALL");
            setPage(1);
          }}
          aria-label="Filter by status"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button asChild className="ml-auto">
          <Link href="/recruiter/assessments/new">
            <Plus className="size-4" aria-hidden="true" />
            New assessment
          </Link>
        </Button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_ITEMS.map((id) => (
            <Skeleton key={id} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load assessments. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        hasFilters ? (
          <EmptyState
            icon={ClipboardList}
            title="No assessments match"
            description="Try a different search or clear the status filter."
          />
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No assessments yet"
            description="Create your first assessment from your problem bank."
            action={{
              label: "New assessment",
              onClick: () =>
                router.push("/recruiter/assessments/new"),
            }}
          />
        )
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">
                    Pass / total marks
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.data.map((assessment) => (
                  <tr
                    key={assessment.id}
                    className="interactive border-b border-border last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/recruiter/assessments/${assessment.id}`}
                        className="hover:text-primary"
                      >
                        {assessment.title}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <AssessmentStatusBadge status={assessment.status} />
                    </td>

                    <td className="stat-number px-4 py-3">
                      {assessment.durationMinutes} min
                    </td>

                    <td className="stat-number px-4 py-3">
                      {assessment.passingMarks} / {assessment.totalMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <TablePagination
            page={data.meta?.page ?? page}
            totalPages={data.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}