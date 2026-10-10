"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import { usePaymentSync } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { celebrate } from "@/lib/confetti";
import AuthGuard from "@/components/module/auth/auth-guard";
import { Button } from "@/components/ui/button";

const CONFIRM_TIMEOUT_MS = 60_000;

const SUBSCRIPTION_URL = "/dashboard/billing/subscription";
const PAYMENT_HISTORY_URL = "/dashboard/billing/payments";

function Notice({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex max-w-sm flex-col items-center gap-3 text-center">
      {icon}

      <p className="text-lg font-semibold">{title}</p>

      <p className="text-sm text-muted-foreground">{description}</p>

      {children ? (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function BillingSuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId") ?? "";

  const queryClient = useQueryClient();
  const celebrated = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [timedOut, setTimedOut] = useState(false);

  const startConfirmationTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setTimedOut(false);

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setTimedOut(true);
    }, CONFIRM_TIMEOUT_MS);
  }, []);

  useEffect(() => {
    startConfirmationTimer();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [startConfirmationTimer]);

  const { data, error, isError } = usePaymentSync(paymentId, {
    enabled: Boolean(paymentId) && !timedOut,
  });

  const payment = data?.data;
  const status = payment?.status;

  useEffect(() => {
    if (status !== "PAID") {
      return;
    }

    void queryClient.invalidateQueries({
      queryKey: ["company", "subscription"],
    });

    void queryClient.invalidateQueries({
      queryKey: ["payments"],
    });

    if (!celebrated.current) {
      celebrated.current = true;
      celebrate();
    }
  }, [status, queryClient]);

  const handleRetry = useCallback(() => {
    startConfirmationTimer();

    void queryClient.invalidateQueries({
      queryKey: ["payments"],
    });
  }, [queryClient, startConfirmationTimer]);

  const subscriptionButton = (
    <Button asChild>
      <Link href={SUBSCRIPTION_URL}>View subscription</Link>
    </Button>
  );

  const paymentHistoryButton = (
    <Button variant="outline" asChild>
      <Link href={PAYMENT_HISTORY_URL}>Payment history</Link>
    </Button>
  );

  if (!paymentId) {
    return (
      <Notice
        icon={
          <TriangleAlert
            className="h-12 w-12 text-amber-500"
            aria-hidden="true"
          />
        }
        title="Payment information missing"
        description="We couldn't find a payment ID in this page URL. Please check your payment history or subscription."
      >
        {subscriptionButton}
        {paymentHistoryButton}
      </Notice>
    );
  }

  if (status === "PAID") {
    return (
      <Notice
        icon={
          <CheckCircle2
            className="h-14 w-14 text-emerald-500"
            aria-hidden="true"
          />
        }
        title="Payment successful!"
        description="Your payment has been confirmed. Your subscription information is being updated."
      >
        {subscriptionButton}
        {paymentHistoryButton}
      </Notice>
    );
  }

  if (status === "FAILED" || status === "CANCELLED") {
    return (
      <Notice
        icon={
          <XCircle
            className="h-14 w-14 text-destructive"
            aria-hidden="true"
          />
        }
        title={
          status === "FAILED" ? "Payment failed" : "Payment cancelled"
        }
        description={
          status === "FAILED"
            ? "Your payment could not be completed. Please check your payment details and try again."
            : "The payment was cancelled before completion. You can return to your subscription page to continue."
        }
      >
        {subscriptionButton}
        {paymentHistoryButton}
      </Notice>
    );
  }

  if (status === "REFUNDED") {
    return (
      <Notice
        icon={
          <CheckCircle2
            className="h-14 w-14 text-muted-foreground"
            aria-hidden="true"
          />
        }
        title="Payment refunded"
        description="This payment has been marked as refunded. Check your payment history for its details."
      >
        {paymentHistoryButton}
        {subscriptionButton}
      </Notice>
    );
  }

  if (isError && !payment) {
    const errorDescription = isApiError(error)
      ? error.message
      : "We couldn't confirm your payment right now. Please try again.";

    return (
      <Notice
        icon={
          <TriangleAlert
            className="h-12 w-12 text-amber-500"
            aria-hidden="true"
          />
        }
        title="Unable to confirm payment"
        description={errorDescription}
      >
        <Button onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Try again
        </Button>

        {paymentHistoryButton}
      </Notice>
    );
  }

  if (timedOut) {
    return (
      <Notice
        icon={
          <TriangleAlert
            className="h-12 w-12 text-amber-500"
            aria-hidden="true"
          />
        }
        title="Confirmation is taking longer than expected"
        description="Your payment may still be processing. Retry the confirmation or check your payment history before making another payment."
      >
        <Button onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          Retry confirmation
        </Button>

        {subscriptionButton}
      </Notice>
    );
  }

  return (
    <Notice
      icon={
        <Loader2
          className="h-12 w-12 animate-spin text-primary"
          aria-hidden="true"
        />
      }
      title="Confirming your payment"
      description="Please wait while we verify your payment. This may take a moment."
    />
  );
}

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthGuard>
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2
                className="h-10 w-10 animate-spin text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                Loading payment information...
              </p>
            </div>
          }
        >
          <BillingSuccessContent />
        </Suspense>
      </AuthGuard>
    </div>
  );
}