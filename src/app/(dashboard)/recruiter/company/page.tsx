"use client";

import { useMyCompany } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyProfileCard } from "@/components/module/company/CompanyProfileCard";
import { SubscriptionCard } from "@/components/module/company/SubscriptionCard";

export default function RecruiterCompanyPage() {
  const { data, isPending, isError } = useMyCompany();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and subscription.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {isPending ? (
          <Skeleton className="h-64 w-full" />
        ) : isError || !data?.data ? (
          <div className="status-danger rounded-md border px-4 py-3 text-sm">
            Couldn&apos;t load your company profile. Try refreshing the page.
          </div>
        ) : (
          <CompanyProfileCard company={data.data} />
        )}

        <SubscriptionCard />
      </div>
    </div>
  );
}