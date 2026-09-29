import type { PaymentStatus } from "@/types";

const CLASS_MAP: Record<PaymentStatus, string> = {
  PENDING: "status-pending",
  PROCESSING: "status-pending",
  PAID: "status-paid",
  FAILED: "status-failed",
  CANCELLED: "status-cancelled",
  REFUNDED: "status-refunded",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CLASS_MAP[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}