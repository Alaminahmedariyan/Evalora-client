"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Users } from "lucide-react";

import { useCandidates, useDebounce } from "@/hooks";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsFromName,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

const skeletonItems = [
  "candidate-skeleton-1",
  "candidate-skeleton-2",
  "candidate-skeleton-3",
  "candidate-skeleton-4",
  "candidate-skeleton-5",
  "candidate-skeleton-6",
];

export function CandidateDirectoryTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useCandidates({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
  });

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-36 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load candidates.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search by headline, location, or phone..."
        className="max-w-xs"
      />

      {!data?.data.length ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="Try adjusting your search."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/recruiter/candidates/${candidate.id}`}
              >
                <div className="card-evalora interactive h-full p-5 hover:border-primary/40">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={candidate.user.image ?? undefined}
                        alt={candidate.user.name}
                      />
                      <AvatarFallback>
                        {initialsFromName(candidate.user.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {candidate.user.name}
                      </p>

                      {candidate.headline ? (
                        <p className="truncate text-xs text-muted-foreground">
                          {candidate.headline}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                    {candidate.location ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin
                          className="size-3.5"
                          aria-hidden="true"
                        />
                        {candidate.location}
                      </span>
                    ) : null}

                    {candidate.experienceYears !== null ? (
                      <span className="flex items-center gap-1.5">
                        <Briefcase
                          className="size-3.5"
                          aria-hidden="true"
                        />
                        {candidate.experienceYears} yr
                        {candidate.experienceYears === 1 ? "" : "s"}{" "}
                        experience
                      </span>
                    ) : null}
                  </div>

                  {candidate.skills &&
                  candidate.skills.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.skills
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground"
                          >
                            {skill}
                          </span>
                        ))}

                      {candidate.skills.length > 4 ? (
                        <span className="text-[11px] text-muted-foreground">
                          +{candidate.skills.length - 4} more
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
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