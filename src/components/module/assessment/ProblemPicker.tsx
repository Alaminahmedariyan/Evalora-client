"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { useProblems } from "@/hooks";
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

export function ProblemPicker({
  selected,
  onChange,
}: {
  selected: SelectedProblem[];
  onChange: (next: SelectedProblem[]) => void;
}) {
  const [search, setSearch] = useState("");
  const { data } = useProblems({ limit: 50, search: search || undefined });

  const available = (data?.data ?? []).filter((p) => !selected.some((s) => s.problemId === p.id));

  function addProblem(problem: ProblemListItem) {
    onChange([
      ...selected,
      { problemId: problem.id, order: selected.length + 1, title: problem.title, type: problem.type, difficulty: problem.difficulty, marks: problem.defaultMarks },
    ]);
  }

  function removeProblem(problemId: string) {
    onChange(
      selected
        .filter((s) => s.problemId !== problemId)
        .map((s, i) => ({ ...s, order: i + 1 })),
    );
  }

  function updateMarks(problemId: string, marks: number) {
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
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <div className="mt-1 flex gap-1.5">
                  <ProblemTypeBadge type={item.type} />
                  <DifficultyBadge difficulty={item.difficulty} />
                </div>
              </div>
              <Input
                type="number"
                min={1}
                value={item.marks}
                onChange={(e) => updateMarks(item.problemId, Number(e.target.value))}
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
        {available.length > 0 ? (
          <div className="flex max-h-48 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border">
            {available.map((problem) => (
              <button
                key={problem.id}
                type="button"
                onClick={() => addProblem(problem)}
                className="interactive flex items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span>{problem.title}</span>
                <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}