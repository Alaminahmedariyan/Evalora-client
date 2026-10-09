
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Code2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { useDeleteProblem, useProblems } from "@/hooks";
import { useDebounce } from "@/hooks/debounce.hook";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import type { Difficulty, ProblemType } from "@/types";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProblemTypeBadge } from "./ProblemTypeBadge";
import { DifficultyBadge } from "./DifficultyBadge";

const DIFFICULTY_OPTIONS: { value: Difficulty | "ALL"; label: string }[] = [
  { value: "ALL", label: "All difficulties" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const SKELETON_ITEMS = [
  "problem-skeleton-1",
  "problem-skeleton-2",
  "problem-skeleton-3",
  "problem-skeleton-4",
  "problem-skeleton-5",
];

export function ProblemList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProblemType | "ALL">("ALL");
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // The input updates instantly; the request only goes out after the
  // candidate has stopped typing for 400ms. trim() so a lone space never
  // triggers a search.
  const debouncedSearch = useDebounce(search.trim(), 400);

  const {
    data,
    isPending,
    isError,
    isPlaceholderData,
  } = useProblems({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    type: type === "ALL" ? undefined : type,
    difficulty: difficulty === "ALL" ? undefined : difficulty,
  });

  const deleteMutation = useDeleteProblem();

  const filtersActive =
    search !== "" || type !== "ALL" || difficulty !== "ALL";

  function clearFilters() {
    setSearch("");
    setType("ALL");
    setDifficulty("ALL");
    setPage(1);
  }

  async function handleDelete(id: string) {
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
        <div className="relative w-full max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search problems..."
            aria-label="Search problems"
            className="pl-9"
          />
        </div>

        <select
          value={difficulty}
          onChange={(e) => {
            setDifficulty(e.target.value as Difficulty | "ALL");
            setPage(1);
          }}
          aria-label="Filter by difficulty"
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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

      <Tabs
        value={type}
        onValueChange={(value) => {
          setType(value as ProblemType | "ALL");
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="MCQ">MCQ</TabsTrigger>
          <TabsTrigger value="CODING">Coding</TabsTrigger>
          <TabsTrigger value="WRITTEN">Written</TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_ITEMS.map((id) => (
            <Skeleton key={id} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load problems. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        filtersActive ? (
          <EmptyState
            icon={Search}
            title="No matching problems"
            description="Try a different search or clear the filters."
            action={{ label: "Clear filters", onClick: clearFilters }}
          />
        ) : (
          <EmptyState
            icon={Code2}
            title="No problems yet"
            description="Create your first problem to start building assessments."
            action={{
              label: "New problem",
              onClick: () => router.push("/recruiter/problems/new"),
            }}
          />
        )
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {data.meta?.total ?? data.data.length} problem
            {(data.meta?.total ?? data.data.length) === 1 ? "" : "s"}
          </p>

          <div
            className={cn(
              "card-evalora overflow-hidden transition-opacity",
              isPlaceholderData && "opacity-60",
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Difficulty</th>
                    <th className="px-4 py-3 font-medium">Marks</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.data.map((problem) => (
                    <tr
                      key={problem.id}
                      className="interactive border-b border-border last:border-0 hover:bg-accent/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/recruiter/problems/${problem.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {problem.title}
                        </Link>
                        {problem.isPublic ? (
                          <span className="status-neutral ml-2 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                            Public
                          </span>
                        ) : null}
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

                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(problem.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/recruiter/problems/${problem.id}`}
                            className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label={`Open ${problem.title}`}
                          >
                            <Pencil className="size-4" aria-hidden="true" />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                id: problem.id,
                                title: problem.title,
                              })
                            }
                            className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                            aria-label={`Delete ${problem.title}`}
                          >
                            <Trash2 className="size-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this problem?"
        description={
          deleteTarget
            ? `"${deleteTarget.title}" will be removed from your question bank. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) void handleDelete(deleteTarget.id);
        }}
      />
    </div>
  );
}