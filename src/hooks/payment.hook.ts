import { useMutation, useQuery } from "@tanstack/react-query";

import { createCheckoutSession, getAllPayments, getMyPayments, getPaymentById, syncPayment } from "@/api";
import type { CreateCheckoutPayload, PaymentListParams } from "@/types";

export function useCreateCheckout() {
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }: { payload: CreateCheckoutPayload; idempotencyKey: string }) =>
      createCheckoutSession(payload, idempotencyKey),
  });
}

export function useMyPayments(params: PaymentListParams) {
  return useQuery({ queryKey: ["payments", "me", params], queryFn: () => getMyPayments(params) });
}

export function useAllPayments(params: PaymentListParams) {
  return useQuery({ queryKey: ["payments", "all", params], queryFn: () => getAllPayments(params) });
}

export function usePayment(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Used by the billing success page. Each poll asks the backend to check the
 * payment with Stripe, so it finishes even if the webhook never arrives.
 * Polling stops by itself once the payment is no longer pending.
 */
export function usePaymentSync(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["payment", id, "sync"],
    queryFn: () => syncPayment(id),
    enabled: !!id && (options?.enabled ?? true),
    retry: 1,
    refetchInterval: (query) => {
      const status = query.state.data?.data.status;

      return status === "PENDING" || status === "PROCESSING" || status === undefined ? 3000 : false;
    },
  });
}