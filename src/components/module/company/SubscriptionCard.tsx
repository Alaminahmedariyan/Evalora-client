"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

import {
  useCancelSubscription,
  useCreateCheckout,
  useMySubscription,
  useUpdateSubscription,
} from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { readPlanInfo } from "@/lib/plan-info";
import { cn } from "@/lib/utils";
import {
  PLAN_LABEL,
  PLAN_ORDER,
  PLAN_PRICE_DISPLAY,
  formatLimit,
  type SubscriptionPlan,
} from "@/constants/plans";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(value: string | null) {
  if (!value) return null;

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function UsageRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const reached = limit !== null && used >= limit;
  const percent = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("stat-number font-medium", reached && "text-danger")}>
          {used} / {formatLimit(limit)}
        </span>
      </div>

      {limit !== null ? (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={limit}
          aria-valuenow={Math.min(used, limit)}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full", reached ? "bg-danger" : "bg-primary")}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

export function SubscriptionCard() {
  const { data, isPending } = useMySubscription();
  const checkoutMutation = useCreateCheckout();
  const downgradeMutation = useUpdateSubscription();
  const cancelMutation = useCancelSubscription();

  const [pendingPlan, setPendingPlan] =
    useState<SubscriptionPlan | null>(null);

  if (isPending) {
    return (
      <Card>
        <CardContent className="flex flex-col gap-3 p-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  const subscription = data?.data;
  const planInfo = readPlanInfo(subscription);

  const currentPlan: SubscriptionPlan =
    planInfo?.effectivePlan ??
    (subscription && "plan" in subscription ? subscription.plan : "FREE");

  const isCancelled =
    subscription &&
    "status" in subscription &&
    subscription.status === "CANCELLED";

  const isExpired =
    subscription &&
    "status" in subscription &&
    subscription.status === "EXPIRED";

  const periodEnd =
    subscription && "currentPeriodEnd" in subscription
      ? subscription.currentPeriodEnd
      : null;

  const periodLabel = isCancelled
    ? "Ends on"
    : isExpired
      ? "Expired on"
      : "Active until";

  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const keepsPaidAccess = !isCancelled && !isExpired;

  async function handlePlanClick(plan: SubscriptionPlan) {
    if (plan === "FREE") {
      if (
        !window.confirm(
          "Downgrade to Free? You'll lose access to paid-plan limits immediately.",
        )
      ) {
        return;
      }

      setPendingPlan("FREE");

      try {
        await downgradeMutation.mutateAsync("FREE");
        notify.success("Switched to Free");
      } catch (error) {
        notify.error(
          "Couldn't downgrade",
          isApiError(error) ? error.message : undefined,
        );
      } finally {
        setPendingPlan(null);
      }

      return;
    }

    setPendingPlan(plan);

    try {
      const res = await checkoutMutation.mutateAsync({
        payload: { plan },
        idempotencyKey: newIdempotencyKey(),
      });

      window.location.href = res.data.checkoutUrl;
    } catch (error) {
      notify.error(
        "Couldn't start checkout",
        isApiError(error) ? error.message : undefined,
      );
      setPendingPlan(null);
    }
  }

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync();

      notify.success(
        "Subscription cancelled",
        "It stays active until the end of the current period.",
      );
    } catch (error) {
      notify.error(
        "Couldn't cancel subscription",
        isApiError(error) ? error.message : undefined,
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge
            className="size-4 text-primary"
            aria-hidden="true"
          />
          Subscription
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="stat-number text-2xl font-semibold">
              {PLAN_LABEL[currentPlan]}
            </p>

            {periodEnd && (currentPlan !== "FREE" || isExpired) ? (
              <p className="text-xs text-muted-foreground">
                {periodLabel} {formatDate(periodEnd)}
              </p>
            ) : null}
          </div>

          {isCancelled ? (
            <span className="status-danger rounded-full border px-2.5 py-1 text-xs font-medium">
              Cancelled
            </span>
          ) : isExpired ? (
            <span className="status-expired rounded-full border px-2.5 py-1 text-xs font-medium">
              Expired
            </span>
          ) : null}
        </div>

        {planInfo ? (
          <div className="flex flex-col gap-3 rounded-md border border-border p-4">
            <UsageRow
              label="Assessments"
              used={planInfo.usage.assessments}
              limit={planInfo.limits.maxAssessments}
            />
            <UsageRow
              label="Invitations (last 30 days)"
              used={planInfo.usage.invitationsLast30Days}
              limit={planInfo.limits.maxInvitationsPer30Days}
            />
            {(planInfo.limits.maxAssessments !== null &&
              planInfo.usage.assessments >= planInfo.limits.maxAssessments) ||
            (planInfo.limits.maxInvitationsPer30Days !== null &&
              planInfo.usage.invitationsLast30Days >=
                planInfo.limits.maxInvitationsPer30Days) ? (
              <p className="text-xs text-danger">
                You&apos;ve reached a limit on this plan. Upgrade to keep adding more.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-2">
          {PLAN_ORDER.map((plan) => {
            const isLowerPaidPlan =
              plan !== "FREE" &&
              PLAN_ORDER.indexOf(plan) < currentIndex &&
              keepsPaidAccess;

            return (
              <Button
                key={plan}
                size="sm"
                variant={plan === currentPlan ? "default" : "outline"}
                disabled={plan === currentPlan || isLowerPaidPlan}
                isLoading={pendingPlan === plan}
                onClick={() => handlePlanClick(plan)}
              >
                {PLAN_LABEL[plan]}

                {plan !== "FREE" ? (
                  <span className="ml-1 text-[10px] opacity-70">
                    {PLAN_PRICE_DISPLAY[plan]}
                  </span>
                ) : null}
              </Button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          Paid plans are one-time payments that last 30 days and do not renew automatically.
        </p>

        {currentPlan !== "FREE" && !isCancelled ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            isLoading={cancelMutation.isPending}
            className="self-start"
          >
            Cancel subscription
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}