"use client";

import Link from "next/link";
import { Check } from "lucide-react";

import { useGetMe } from "@/hooks";
import {
  PLAN_LABEL,
  PLAN_ORDER,
  PLAN_PERIOD_LABEL,
  PLAN_PRICE_DISPLAY,
  PLAN_TAGLINE,
  planHighlights,
  type SubscriptionPlan,
} from "@/constants/plans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RECOMMENDED: SubscriptionPlan = "PRO";

function ctaFor(plan: SubscriptionPlan, role?: string): { href: string; label: string } {
  if (!role) {
    return {
      href: "/register",
      label: plan === "FREE" ? "Get started free" : `Choose ${PLAN_LABEL[plan]}`,
    };
  }

  if (role === "RECRUITER") {
    return plan === "FREE"
      ? { href: "/recruiter", label: "Go to dashboard" }
      : { href: "/recruiter/subscription", label: `Upgrade to ${PLAN_LABEL[plan]}` };
  }

  if (role === "CANDIDATE") {
    return { href: "/onboarding/company", label: "Register your company" };
  }

  return { href: "/admin", label: "Go to dashboard" };
}

export function PricingCards() {
  const { data } = useGetMe();
  const role = data?.data?.role;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {PLAN_ORDER.map((plan) => {
        const highlighted = plan === RECOMMENDED;
        const cta = ctaFor(plan, role);

        return (
          <div
            key={plan}
            className={cn(
              "card-evalora flex flex-col p-6",
              highlighted && "border-primary/50 ring-1 ring-primary/30",
            )}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{PLAN_LABEL[plan]}</h2>
              {highlighted ? (
                <span className="status-active rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  Recommended
                </span>
              ) : null}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{PLAN_TAGLINE[plan]}</p>

            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="stat-number text-3xl font-semibold">{PLAN_PRICE_DISPLAY[plan]}</span>
              <span className="text-xs text-muted-foreground">{PLAN_PERIOD_LABEL[plan]}</span>
            </p>

            <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-sm">
              {planHighlights(plan).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button asChild className="mt-6" variant={highlighted ? "default" : "outline"}>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
}