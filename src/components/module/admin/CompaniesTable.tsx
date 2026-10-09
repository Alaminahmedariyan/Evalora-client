"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, ShieldCheck, ShieldQuestion, Trash2 } from "lucide-react";

import { useCompanies, useDebounce, useDeleteCompany, useVerifyCompany } from "@/hooks";

import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";

import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type VerifiedFilter = "ALL" | "VERIFIED" | "UNVERIFIED";

export function CompaniesTable() {
  const [search, setSearch] = useState("");
  const [verified, setVerified] = useState<VerifiedFilter>("ALL");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isPending, isError } = useCompanies({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    isVerified: verified === "ALL" ? undefined : verified === "VERIFIED",
  });

  const verifyMutation = useVerifyCompany();
  const deleteMutation = useDeleteCompany();

  // Only the row being verified shows a spinner, not every Verify button.
  const verifyingId = verifyMutation.isPending ? verifyMutation.variables : undefined;

  async function handleVerify(id: string, name: string) {
    try {
      await verifyMutation.mutateAsync(id);
      notify.success(`${name} verified`, "The owner has been notified.");
    } catch (error) {
      notify.error("Couldn't verify company", isApiError(error) ? error.message : undefined);
    }
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteMutation.mutateAsync(id);
      notify.success(`${name} deleted`);
    } catch (error) {
      notify.error("Couldn't delete company", isApiError(error) ? error.message : undefined);
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
          aria-label="Search companies"
          className="max-w-xs"
        />

        <Tabs
          value={verified}
          onValueChange={(value) => {
            setVerified(value as VerifiedFilter);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="UNVERIFIED">Awaiting verification</TabsTrigger>
            <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={`company-skeleton-${index + 1}`} className="h-14 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load companies. Try refreshing the page.
        </div>
      ) : !data?.data.length ? (
        <EmptyState
          icon={Building2}
          title={verified === "UNVERIFIED" ? "Nothing awaiting verification" : "No companies found"}
          description={
            verified === "UNVERIFIED" ? "Every registered company has been reviewed." : "Try adjusting your search or filters."
          }
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
                  <th className="px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.data.map((company) => (
                  <tr key={company.id} className="interactive border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarImage src={company.logo ?? undefined} alt={company.name} />
                          <AvatarFallback>{initialsFromName(company.name)}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <Link
                            href={`/admin/companies/${company.id}`}
                            className="block truncate font-medium hover:text-primary"
                          >
                            {company.name}
                          </Link>

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

                    <td className="px-4 py-3 text-muted-foreground">{company.industry ?? "—"}</td>

                    <td className="px-4 py-3">
                      {company.isVerified ? (
                        <span className="status-success inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                          <ShieldCheck className="size-3" aria-hidden="true" />
                          Verified
                        </span>
                      ) : (
                        <span className="status-pending inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                          <ShieldQuestion className="size-3" aria-hidden="true" />
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
                            onClick={() => void handleVerify(company.id, company.name)}
                            isLoading={verifyingId === company.id}
                            disabled={verifyMutation.isPending && verifyingId !== company.id}
                          >
                            Verify
                          </Button>
                        ) : null}

                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => setDeleteTarget({ id: company.id, name: company.name })}
                          className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                          aria-label={`Delete ${company.name}`}
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

          <TablePagination page={data.meta?.page ?? page} totalPages={data.meta?.totalPage ?? 1} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete this company?"
        description={
          deleteTarget
            ? `${deleteTarget.name} will be deleted, its live assessments closed and pending invitations cancelled. Its owner moves back to the Candidate role.`
            : undefined
        }
        confirmLabel="Delete company"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) void handleDelete(deleteTarget.id, deleteTarget.name);
        }}
      />
    </div>
  );
}