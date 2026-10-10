"use client";

import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { SubscriptionCard } from "@/components/module/company/SubscriptionCard";
import { CompanyVerificationBanner } from "@/components/module/company/CompanyVerificationBanner";
import { Button } from "@/components/ui/button";

export default function RecruiterSubscriptionPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subscription</h1>
          <p className="text-sm text-muted-foreground">
            Your current plan, what you have used, and how to upgrade.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/recruiter/payments">
            <ReceiptText className="size-3.5" aria-hidden="true" />
            Payment history
          </Link>
        </Button>
      </div>

      <CompanyVerificationBanner />

      <SubscriptionCard />
    </div>
  );
}