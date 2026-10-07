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
import { Reveal } from "@/components/ui/reveal";
import { PremiumCard } from "@/components/ui/premium-card";

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

type PricingCardsProps = {
  // Use "h3" when the cards sit under a section heading, so the heading order stays correct.
  headingLevel?: "h2" | "h3";
};

export function PricingCards({ headingLevel = "h2" }: PricingCardsProps) {
  const { data } = useGetMe();
  const role = data?.data?.role;
  const Heading = headingLevel;

  return (
    <div className="grid items-stretch gap-6 pt-3 md:grid-cols-3">
      {PLAN_ORDER.map((plan, index) => {
        const highlighted = plan === RECOMMENDED;
        const cta = ctaFor(plan, role);

        return (
          <Reveal key={plan} delay={index * 100} className="h-full">
            <PremiumCard
              variant={highlighted ? "highlight" : "default"}
              className={cn("relative flex h-full flex-col gap-6 p-7", highlighted && "md:-translate-y-3")}
            >
              {highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Recommended
                </span>
              ) : null}

              <div>
                <Heading className="text-lg font-semibold">{PLAN_LABEL[plan]}</Heading>
                <p className="mt-1 text-sm text-muted-foreground">{PLAN_TAGLINE[plan]}</p>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="stat-number text-4xl font-bold tracking-tight">{PLAN_PRICE_DISPLAY[plan]}</span>
                  <span className="text-xs text-muted-foreground">{PLAN_PERIOD_LABEL[plan]}</span>
                </p>
              </div>

              <ul className="flex flex-1 flex-col gap-3 text-sm">
                {planHighlights(plan).map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" variant={highlighted ? "gradient" : "outline"}>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            </PremiumCard>
          </Reveal>
        );
      })}
    </div>
  );
}