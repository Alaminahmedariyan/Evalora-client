import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CheckoutSessionResult,
  CreateCheckoutPayload,
  Payment,
  PaymentListParams,
} from "@/types";

export function createCheckoutSession(payload: CreateCheckoutPayload) {
  return apiClient<ApiResponse<CheckoutSessionResult>>("/payments/checkout", {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
}

export function getMyPayments(params: PaymentListParams) {
  return apiClient<ApiResponse<Payment[]>>("/payments/me", { params });
}

export function getAllPayments(params: PaymentListParams) {
  return apiClient<ApiResponse<Payment[]>>("/payments", { params });
}

export function getPaymentById(id: string) {
  return apiClient<ApiResponse<Payment>>(`/payments/${id}`);
}