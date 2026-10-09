"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Globe, ShieldCheck, ShieldQuestion, Tag } from "lucide-react";

import { useVerifyCompany } from "@/hooks";
import { useCompany } from "@/hooks/company.hook";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminCompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isPending, isError } = useCompany(id);
  const verifyMutation = useVerifyCompany();

  if (isPending) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data?.data) {
    notFound();
  }

  const company = data.data;

  async function handleVerify() {
    try {
      await verifyMutation.mutateAsync(company.id);
      notify.success(`${company.name} verified`, "The owner has been notified.");
    } catch (error) {
      notify.error("Couldn't verify company", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/admin/companies"
        className="interactive inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All companies
      </Link>

      <div className="card-evalora flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={company.logo ?? undefined} alt={company.name} />
              <AvatarFallback className="text-lg">{initialsFromName(company.name)}</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-xl font-semibold">{company.name}</h1>

              {company.isVerified ? (
                <span className="status-success mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  Verified
                </span>
              ) : (
                <span className="status-pending mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium">
                  <ShieldQuestion className="size-3" aria-hidden="true" />
                  Awaiting verification
                </span>
              )}
            </div>
          </div>

          {!company.isVerified ? (
            <Button onClick={() => void handleVerify()} isLoading={verifyMutation.isPending}>
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verify company
            </Button>
          ) : null}
        </div>

        {company.description ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{company.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No description provided.</p>
        )}

        <dl className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">Website</dt>
              <dd className="truncate">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : (
                  "Not provided"
                )}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Tag className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Industry</dt>
              <dd>{company.industry ?? "Not provided"}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Registered</dt>
              <dd>{formatDateTime(company.createdAt)}</dd>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Last updated</dt>
              <dd>{formatDateTime(company.updatedAt)}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}