import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  CheckoutSessionResult,
  CreateCheckoutPayload,
  Payment,
  PaymentListParams,
} from "@/types";

export function createCheckoutSession(payload: CreateCheckoutPayload, idempotencyKey: string) {
  return apiClient<ApiResponse<CheckoutSessionResult>>("/payments/checkout", {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
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

// Asks the backend to check a still-pending payment with Stripe and returns
// the up-to-date payment.
export function syncPayment(id: string) {
  return apiClient<ApiResponse<Payment>>(`/payments/${id}/sync`, { method: "POST" });
}