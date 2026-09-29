import { useMutation, useQuery } from "@tanstack/react-query";

import { createCheckoutSession, getAllPayments, getMyPayments, getPaymentById } from "@/api";
import type { PaymentListParams } from "@/types";

export function useCreateCheckout() {
  return useMutation({ mutationFn: createCheckoutSession });
}

export function useMyPayments(params: PaymentListParams) {
  return useQuery({ queryKey: ["payments", "me", params], queryFn: () => getMyPayments(params) });
}

export function useAllPayments(params: PaymentListParams) {
  return useQuery({ queryKey: ["payments", "all", params], queryFn: () => getAllPayments(params) });
}

/** Used by the billing success page to poll until the webhook lands. */
export function usePayment(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: () => getPaymentById(id),
    enabled: !!id,
    refetchInterval: options?.refetchInterval,
  });
}