"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";

import { useCancelSubscription, useMySubscription, useUpdateSubscription } from "@/hooks";
import { notify } from "@/lib/toast";
import { isApiError } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SubscriptionPlan } from "@/types";

const PLAN_ORDER: SubscriptionPlan[] = ["FREE", "PRO", "ENTERPRISE"];

const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  FREE: "Free",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function SubscriptionCard() {
  const { data, isPending } = useMySubscription();
  const updateMutation = useUpdateSubscription();
  const cancelMutation = useCancelSubscription();
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);

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
  const currentPlan = subscription && "plan" in subscription ? subscription.plan : "FREE";
  const isCancelled = subscription && "status" in subscription && subscription.status === "CANCELLED";

  async function handleChangePlan(plan: SubscriptionPlan) {
    setPendingPlan(plan);
    try {
      await updateMutation.mutateAsync(plan);
      notify.success(`Switched to ${PLAN_LABEL[plan]}`);
    } catch (error) {
      notify.error("Couldn't update plan", isApiError(error) ? error.message : undefined);
    } finally {
      setPendingPlan(null);
    }
  }

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync();
      notify.success("Subscription cancelled", "It stays active until the end of the current period.");
    } catch (error) {
      notify.error("Couldn't cancel subscription", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="size-4 text-primary" aria-hidden="true" />
          Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="stat-number text-2xl font-semibold">{PLAN_LABEL[currentPlan]}</p>
            {subscription && "currentPeriodEnd" in subscription && subscription.currentPeriodEnd ? (
              <p className="text-xs text-muted-foreground">
                {isCancelled ? "Ends" : "Renews"} on {formatDate(subscription.currentPeriodEnd)}
              </p>
            ) : null}
          </div>
          {isCancelled ? <span className="status-danger rounded-full border px-2.5 py-1 text-xs font-medium">Cancelled</span> : null}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {PLAN_ORDER.map((plan) => (
            <Button
              key={plan}
              size="sm"
              variant={plan === currentPlan ? "default" : "outline"}
              disabled={plan === currentPlan}
              isLoading={pendingPlan === plan}
              onClick={() => handleChangePlan(plan)}
            >
              {PLAN_LABEL[plan]}
            </Button>
          ))}
        </div>

        {currentPlan !== "FREE" && !isCancelled ? (
          <Button variant="destructive" size="sm" onClick={handleCancel} isLoading={cancelMutation.isPending} className="self-start">
            Cancel subscription
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
