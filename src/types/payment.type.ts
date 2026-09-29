export type PaymentProvider = "STRIPE" | "BKASH" | "SSLCOMMERZ";
export type PaymentStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";

// Matches PAYMENT_SELECT exactly.
export interface Payment {
  id: string;
  userId: string;
  companyId: string | null;
  subscriptionId: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  amountMinor: number; // BigInt is coerced to Number by app.ts's JSON serializer
  currency: string;
  transactionId: string | null;
  providerPaymentId: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

export interface CreateCheckoutPayload {
  plan: "PRO" | "ENTERPRISE";
}

export interface CheckoutSessionResult {
  paymentId: string;
  checkoutUrl: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  provider?: PaymentProvider;
}