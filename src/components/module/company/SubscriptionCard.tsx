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
import {
  PLAN_LABEL,
  PLAN_ORDER,
  PLAN_PRICE_DISPLAY,
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

  const currentPlan: SubscriptionPlan =
    subscription && "plan" in subscription
      ? subscription.plan
      : "FREE";

  const isCancelled =
    subscription &&
    "status" in subscription &&
    subscription.status === "CANCELLED";

  async function handlePlanClick(plan: SubscriptionPlan) {
    if (plan === "FREE") {
      if (
        !window.confirm(
          "Downgrade to Free? You'll lose access to paid-plan features immediately.",
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

      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="stat-number text-2xl font-semibold">
              {PLAN_LABEL[currentPlan]}
            </p>

            {subscription &&
            "currentPeriodEnd" in subscription &&
            subscription.currentPeriodEnd ? (
              <p className="text-xs text-muted-foreground">
                {isCancelled ? "Ends" : "Renews"} on{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </p>
            ) : null}
          </div>

          {isCancelled ? (
            <span className="status-danger rounded-full border px-2.5 py-1 text-xs font-medium">
              Cancelled
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PLAN_ORDER.map((plan) => (
            <Button
              key={plan}
              size="sm"
              variant={
                plan === currentPlan ? "default" : "outline"
              }
              disabled={plan === currentPlan}
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
          ))}
        </div>

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