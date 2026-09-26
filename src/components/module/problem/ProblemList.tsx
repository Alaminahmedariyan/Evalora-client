"use client";

import Link from "next/link";
import { useState } from "react";
import { Code2, Plus, Trash2 } from "lucide-react";

import { useDeleteProblem, useProblems } from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import type { Difficulty, ProblemType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ProblemTypeBadge } from "./ProblemTypeBadge";
import { DifficultyBadge } from "./DifficultyBadge";
import { EmptyState } from "@/components/ui/emty-stat";

const TYPE_OPTIONS: { value: ProblemType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All types" },
  { value: "MCQ", label: "MCQ" },
  { value: "CODING", label: "Coding" },
  { value: "WRITTEN", label: "Written" },
];

const DIFFICULTY_OPTIONS: { value: Difficulty | "ALL"; label: string }[] = [
  { value: "ALL", label: "All difficulties" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

export function ProblemList() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProblemType | "ALL">("ALL");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isPending, isError } = useProblems({
    page,
    limit: 10,
    search: search || undefined,
    type: type === "ALL" ? undefined : type,
    difficulty: difficulty === "ALL" ? undefined : difficulty,
  });

  const deleteMutation = useDeleteProblem();

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      notify.success("Problem deleted");
    } catch (error) {
      notify.error(
        "Couldn't delete problem",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search problems..."
          className="max-w-xs"
        />

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as ProblemType | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty | "ALL");
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Button asChild className="ml-auto">
          <Link href="/recruiter/problems/new">
            <Plus className="size-4" aria-hidden="true" />
            New problem
          </Link>
        </Button>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={`problem-skeleton-${index + 1}`}
              className="h-12 w-full"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load problems. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Code2}
          title="No problems yet"
          description="Create your first problem to start building assessments."
          action={{
            label: "New problem",
            onClick: () =>
              (window.location.href = "/recruiter/problems/new"),
          }}
        />
      ) : (
        <>
          <div className="card-evalora overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>

              <tbody>
                {data.data.map((problem) => (
                  <tr
                    key={problem.id}
                    className="interactive border-b border-border last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/recruiter/problems/${problem.id}`}
                        className="hover:text-primary"
                      >
                        {problem.title}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <ProblemTypeBadge type={problem.type} />
                    </td>

                    <td className="px-4 py-3">
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </td>

                    <td className="stat-number px-4 py-3">
                      {problem.defaultMarks}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(problem.id, problem.title)
                        }
                        className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                        aria-label={`Delete ${problem.title}`}
                      >
                        <Trash2
                          className="size-4"
                          aria-hidden="true"
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.meta && data.meta.totalPage > 1 ? (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {data.meta.page} of {data.meta.totalPage}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}