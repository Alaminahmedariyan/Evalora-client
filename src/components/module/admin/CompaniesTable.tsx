"use client";

import { useState } from "react";
import {
  Building2,
  ShieldCheck,
  ShieldQuestion,
  Trash2,
} from "lucide-react";

import {
  useCompanies,
  useDebounce,
  useDeleteCompany,
  useVerifyCompany,
} from "@/hooks";

import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  initialsFromName,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";

type VerifiedFilter = "ALL" | "VERIFIED" | "UNVERIFIED";

export function CompaniesTable() {
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState<VerifiedFilter>("ALL");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useCompanies({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    isVerified:
      verified === "ALL" ? undefined : verified === "VERIFIED",
  });

  const verifyMutation = useVerifyCompany();
  const deleteMutation = useDeleteCompany();

  async function handleVerify(id: string, name: string) {
    try {
      await verifyMutation.mutateAsync(id);
      notify.success(`${name} verified`);
    } catch (error) {
      notify.error(
        "Couldn't verify company",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  async function handleDelete(id: string, name: string) {
    if (
      !window.confirm(
        `Delete ${name}? Its owner will be moved back to the Candidate role.`,
      )
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      notify.success(`${name} deleted`);
    } catch (error) {
      notify.error(
        "Couldn't delete company",
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
          placeholder="Search companies..."
          className="max-w-xs"
        />

        <select
          value={verified}
          onChange={(e) => {
            setVerified(e.target.value as VerifiedFilter);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="ALL">All companies</option>
          <option value="VERIFIED">Verified</option>
          <option value="UNVERIFIED">Awaiting verification</option>
        </select>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load companies. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div className="card-evalora overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Industry</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>

              <tbody>
                {data.data.map((company) => (
                  <tr
                    key={company.id}
                    className="interactive border-b border-border last:border-0 hover:bg-accent/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage
                            src={company.logo ?? undefined}
                            alt={company.name}
                          />
                          <AvatarFallback>
                            {initialsFromName(company.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {company.name}
                          </p>

                          {company.website ? (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate text-xs text-muted-foreground hover:text-foreground"
                            >
                              {company.website.replace(/^https?:\/\//, "")}
                            </a>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {company.industry ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      {company.isVerified ? (
                        <span className="status-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                          <ShieldCheck
                            className="size-3"
                            aria-hidden="true"
                          />
                          Verified
                        </span>
                      ) : (
                        <span className="status-pending inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                          <ShieldQuestion
                            className="size-3"
                            aria-hidden="true"
                          />
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {!company.isVerified ? (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleVerify(company.id, company.name)
                            }
                            isLoading={verifyMutation.isPending}
                          >
                            Verify
                          </Button>
                        ) : null}

                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            handleDelete(company.id, company.name)
                          }
                          className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                          aria-label={`Delete ${company.name}`}
                        >
                          <Trash2
                            className="size-4"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
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