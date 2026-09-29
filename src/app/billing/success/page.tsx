"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { usePayment } from "@/hooks";
import { celebrate } from "@/lib/confetti";
import AuthGuard from "@/components/module/auth/auth-guard";
import { useEffect, useRef } from "react";

function BillingSuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("paymentId") ?? "";
  const celebrated = useRef(false);

  // Stripe's webhook usually lands within a couple of seconds, but there's
  // no guarantee it beats this redirect — poll until the Payment row
  // actually flips to PAID/FAILED instead of assuming success from the URL alone.
  const { data, isPending } = usePayment(paymentId, { refetchInterval: 2000 });
  const payment = data?.data;

  useEffect(() => {
    if (payment?.status === "PAID" && !celebrated.current) {
      celebrated.current = true;
      celebrate();
    }
  }, [payment?.status]);

  if (isPending || !payment || payment.status === "PENDING" || payment.status === "PROCESSING") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
        <p className="text-sm font-medium">Confirming your payment...</p>
        <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
      </div>
    );
  }

  if (payment.status === "PAID") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden="true" />
        <p className="text-lg font-semibold">Payment successful</p>
        <p className="text-sm text-muted-foreground">Your subscription has been updated.</p>
        <Link href="/recruiter/subscription" className="text-sm text-primary hover:underline">
          Go to subscription
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <XCircle className="size-10 text-danger" aria-hidden="true" />
      <p className="text-lg font-semibold">Payment didn&apos;t go through</p>
      <p className="text-sm text-muted-foreground">No charge was completed. You can try again from the subscription page.</p>
      <Link href="/recruiter/subscription" className="text-sm text-primary hover:underline">
        Back to subscription
      </Link>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <AuthGuard>
        <BillingSuccessContent />
      </AuthGuard>
    </div>
  );
}