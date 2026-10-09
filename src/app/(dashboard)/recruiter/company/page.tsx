"use client";

import { useMyCompany } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CompanyProfileCard } from "@/components/module/company/CompanyProfileCard";
import { SubscriptionCard } from "@/components/module/company/SubscriptionCard";
import { RegisterCompanyForm } from "@/components/form";
import { CompanyVerificationBanner } from "@/components/module/company/CompanyVerificationBanner";

export default function RecruiterCompanyPage() {
  const { data, isPending, isError, error } = useMyCompany();

  // GET /companies/me returns 404 when the user has no (non-deleted)
  // company. That's an expected "empty" state, not a real failure.
  // Reads the HTTP status from whichever shape the API client throws.
  const errorShape = error as {
    status?: number;
    statusCode?: number;
    response?: { status?: number };
  } | null;
  const status = errorShape?.status ?? errorShape?.statusCode ?? errorShape?.response?.status;
  const hasNoCompany = isError && status === 404;

  const company = data?.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile and subscription.</p>
      </div>

      <CompanyVerificationBanner />

      {isPending ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : hasNoCompany ? (
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <RegisterCompanyForm />
          </CardContent>
        </Card>
      ) : isError || !company ? (
        <div className="status-danger rounded-md border px-4 py-3 text-sm">
          Couldn&apos;t load your company profile. Try refreshing the page.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <CompanyProfileCard company={company} />

          {/* Only rendered once a company exists — the subscription
              endpoint 404s without one. */}
          <SubscriptionCard />
        </div>
      )}
    </div>
  );
}
