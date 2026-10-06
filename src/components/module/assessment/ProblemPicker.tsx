"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { useDebounce, useProblems } from "@/hooks";
import type { AssessmentProblemInput, ProblemListItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProblemTypeBadge } from "@/components/module/problem/ProblemTypeBadge";
import { DifficultyBadge } from "@/components/module/problem/DifficultyBadge";

interface SelectedProblem extends AssessmentProblemInput {
  title: string;
  type: ProblemListItem["type"];
  difficulty: ProblemListItem["difficulty"];
}

const PAGE_SIZE = 50;
const MAX_MARKS = 1000;

const renumber = (items: SelectedProblem[]) => items.map((item, index) => ({ ...item, order: index + 1 }));

export function ProblemPicker({
  selected,
  onChange,
}: {
  selected: SelectedProblem[];
  onChange: (next: SelectedProblem[]) => void;
}) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useProblems({
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const results = data?.data ?? [];
  const available = results.filter((p) => !selected.some((s) => s.problemId === p.id));
  const hasMore = (data?.meta?.total ?? results.length) > results.length;

  function addProblem(problem: ProblemListItem) {
    onChange(
      renumber([
        ...selected,
        {
          problemId: problem.id,
          order: selected.length + 1,
          title: problem.title,
          type: problem.type,
          difficulty: problem.difficulty,
          marks: problem.defaultMarks,
        },
      ]),
    );
  }

  function removeProblem(problemId: string) {
    onChange(renumber(selected.filter((s) => s.problemId !== problemId)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= selected.length) return;

    const next = [...selected];
    [next[index], next[target]] = [next[target] as SelectedProblem, next[index] as SelectedProblem];
    onChange(renumber(next));
  }

  function updateMarks(problemId: string, raw: string) {
    // An empty or invalid box falls back to 1 so the total never silently becomes 0.
    const marks = Math.min(MAX_MARKS, Math.max(1, Math.floor(Number(raw)) || 1));
    onChange(selected.map((s) => (s.problemId === problemId ? { ...s, marks } : s)));
  }

  const totalMarks = selected.reduce((sum, s) => sum + s.marks, 0);

  return (
    <div className="flex flex-col gap-4">
      {selected.length > 0 ? (
        <div className="card-evalora flex flex-col divide-y divide-border">
          {selected.map((item, index) => (
            <div key={item.problemId} className="flex items-center gap-3 px-4 py-3">
              <span className="stat-number w-5 shrink-0 text-xs text-muted-foreground">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="mt-1 flex gap-1.5">
                  <ProblemTypeBadge type={item.type} />
                  <DifficultyBadge difficulty={item.difficulty} />
                </div>
              </div>

              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="interactive rounded p-0.5 text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
                  aria-label={`Move ${item.title} up`}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === selected.length - 1}
                  className="interactive rounded p-0.5 text-muted-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-30"
                  aria-label={`Move ${item.title} down`}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
              </div>

              <Input
                type="number"
                min={1}
                max={MAX_MARKS}
                value={item.marks}
                onChange={(e) => updateMarks(item.problemId, e.target.value)}
                aria-label={`Marks for ${item.title}`}
                className="h-8 w-20 text-xs"
              />
              <button
                type="button"
                onClick={() => removeProblem(item.problemId)}
                className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
                aria-label={`Remove ${item.title}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">Total marks</span>
            <span className="stat-number font-semibold">{totalMarks}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No problems added yet — search below to add some.</p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="problem-search">Add problems</Label>
        <Input
          id="problem-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your problem bank..."
        />

        {isPending ? (
          <p className="text-xs text-muted-foreground">Loading problems...</p>
        ) : isError ? (
          <p role="alert" className="text-xs text-danger">
            Couldn&apos;t load your problems. Try again in a moment.
          </p>
        ) : results.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {debouncedSearch ? (
              "No problems match your search."
            ) : (
              <>
                Your problem bank is empty.{" "}
                <Link href="/recruiter/problems/new" className="text-primary hover:underline">
                  Create a problem
                </Link>{" "}
                first.
              </>
            )}
          </p>
        ) : available.length === 0 ? (
          <p className="text-xs text-muted-foreground">Every matching problem is already in this assessment.</p>
        ) : (
          <div className="flex max-h-56 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border">
            {available.map((problem) => (
              <button
                key={problem.id}
                type="button"
                onClick={() => addProblem(problem)}
                className="interactive flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="min-w-0 flex-1 truncate">{problem.title}</span>
                <ProblemTypeBadge type={problem.type} />
                <DifficultyBadge difficulty={problem.difficulty} />
                <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        )}

        {hasMore ? (
          <p className="text-xs text-muted-foreground">
            Showing the first {PAGE_SIZE} problems. Type in the box to narrow the list.
          </p>
        ) : null}
      </div>
    </div>
  );
}