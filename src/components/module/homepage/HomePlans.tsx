import Link from "next/link";
import { Check } from "lucide-react";

import {
  PLAN_LABEL,
  PLAN_ORDER,
  PLAN_PERIOD_LABEL,
  PLAN_PRICE_DISPLAY,
  PLAN_TAGLINE,
  planHighlights,
  type SubscriptionPlan,
} from "@/constants/plans";
import { MarketingSectionHeading } from "@/components/module/marketing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RECOMMENDED: SubscriptionPlan = "PRO";

export function HomePlans() {
  return (
    <div className="flex flex-col gap-12">
      <MarketingSectionHeading
        eyebrow="Pricing"
        title={
          <>
            Start free, <span className="text-gradient-brand">upgrade when you grow</span>
          </>
        }
        description="Paid plans are one-time payments for 30 days, with no automatic renewal."
      >
        <Button asChild variant="glass">
          <Link href="/pricing">Compare plans</Link>
        </Button>
      </MarketingSectionHeading>

      <div className="grid items-stretch gap-6 pt-3 md:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const highlighted = plan === RECOMMENDED;

          return (
            <div
              key={plan}
              className={cn(
                "relative flex flex-col gap-6 p-7",
                highlighted ? "card-gradient-border md:-translate-y-3" : "card-premium",
              )}
            >
              {highlighted ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gradient px-3 py-1 text-xs font-semibold text-white shadow-md">
                  Recommended
                </span>
              ) : null}

              <div>
                <h3 className="text-lg font-semibold">{PLAN_LABEL[plan]}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{PLAN_TAGLINE[plan]}</p>
                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="stat-number text-4xl font-bold tracking-tight">{PLAN_PRICE_DISPLAY[plan]}</span>
                  <span className="text-xs text-muted-foreground">{PLAN_PERIOD_LABEL[plan]}</span>
                </p>
              </div>

              <ul className="flex flex-1 flex-col gap-3 text-sm">
                {planHighlights(plan).map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" variant={highlighted ? "gradient" : "outline"}>
                <Link href="/register">{plan === "FREE" ? "Get started free" : `Choose ${PLAN_LABEL[plan]}`}</Link>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}