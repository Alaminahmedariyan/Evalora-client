"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import type { CandidateProfile } from "@/types";
import { useCandidates, useDebounce, useInvitationsForAssessment } from "@/hooks";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/ui/table-pagination";

export type PickedCandidate = {
  email: string;
  name: string;
  image: string | null;
};

const PAGE_SIZE = 8;

const SKELETON_ITEMS = ["picker-row-1", "picker-row-2", "picker-row-3", "picker-row-4", "picker-row-5"];

function toPicked(candidate: CandidateProfile): PickedCandidate {
  return {
    email: candidate.user.email.toLowerCase(),
    name: candidate.user.name,
    image: candidate.user.image,
  };
}

/**
 * A searchable, paged list of candidates who share their profile with
 * recruiters. The selection lives in the parent so it survives paging and
 * searching. People already invited to this assessment are shown but cannot
 * be picked again.
 */
export function CandidatePicker({
  assessmentId,
  selected,
  onChange,
  maxSelectable,
}: {
  assessmentId: string;
  selected: Map<string, PickedCandidate>;
  onChange: (next: Map<string, PickedCandidate>) => void;
  // How many people may be selected in total (the plan limit, at most 100).
  maxSelectable: number;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search.trim(), 400);

  const { data, isPending, isError } = useCandidates({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  // Anyone already invited (any status) can't be invited again.
  const { data: invitedData } = useInvitationsForAssessment(assessmentId, { page: 1, limit: 100 });

  const invited = useMemo(
    () => new Set((invitedData?.data ?? []).map((invitation) => invitation.email.toLowerCase())),
    [invitedData],
  );

  const candidates = data?.data ?? [];
  const atLimit = selected.size >= maxSelectable;

  const selectableOnPage = candidates.filter((candidate) => !invited.has(candidate.user.email.toLowerCase()));
  const allOnPageSelected =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((candidate) => selected.has(candidate.user.email.toLowerCase()));

  function toggle(candidate: CandidateProfile) {
    const picked = toPicked(candidate);
    const next = new Map(selected);

    if (next.has(picked.email)) {
      next.delete(picked.email);
    } else if (next.size < maxSelectable) {
      next.set(picked.email, picked);
    }

    onChange(next);
  }

  function toggleAllOnPage() {
    const next = new Map(selected);

    if (allOnPageSelected) {
      for (const candidate of selectableOnPage) {
        next.delete(candidate.user.email.toLowerCase());
      }
    } else {
      for (const candidate of selectableOnPage) {
        if (next.size >= maxSelectable) break;
        const picked = toPicked(candidate);
        next.set(picked.email, picked);
      }
    }

    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
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
          placeholder="Search by headline, location or phone..."
          aria-label="Search candidates"
          className="pl-9"
        />
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {SKELETON_ITEMS.map((id) => (
            <Skeleton key={id} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">Couldn&apos;t load candidates.</div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Only candidates who share their profile with recruiters appear here. You can also invite anyone by email."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border">
            <label
              htmlFor="picker-select-all"
              className="flex cursor-pointer items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground"
            >
              <Checkbox
                id="picker-select-all"
                checked={allOnPageSelected}
                disabled={selectableOnPage.length === 0}
                onCheckedChange={toggleAllOnPage}
              />
              Select all on this page
              <span className="ml-auto stat-number">
                {selectableOnPage.length} available
              </span>
            </label>

            <div className="flex flex-col divide-y divide-border">
              {candidates.map((candidate) => {
                const email = candidate.user.email.toLowerCase();
                const isInvited = invited.has(email);
                const isSelected = selected.has(email);
                const disabled = isInvited || (!isSelected && atLimit);
                const checkboxId = `picker-${candidate.id}`;

                return (
                  <label
                    key={candidate.id}
                    htmlFor={checkboxId}
                    className={cn(
                      "interactive flex items-center gap-3 px-4 py-3",
                      disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-accent/50",
                      isSelected && "bg-primary/5",
                    )}
                  >
                    <Checkbox
                      id={checkboxId}
                      checked={isSelected}
                      disabled={disabled}
                      onCheckedChange={() => toggle(candidate)}
                    />

                    <Avatar>
                      <AvatarImage src={candidate.user.image ?? undefined} alt={candidate.user.name} />
                      <AvatarFallback>{initialsFromName(candidate.user.name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{candidate.user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{candidate.user.email}</p>
                    </div>

                    {isInvited ? (
                      <span className="status-neutral shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium">
                        Invited
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          </div>

          <TablePagination
            page={data?.meta?.page ?? page}
            totalPages={data?.meta?.totalPage ?? 1}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}