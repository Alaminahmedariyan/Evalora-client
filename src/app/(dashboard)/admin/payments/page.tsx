import { PaymentHistoryTable } from "@/components/module/payment";

export default function AdminPaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">All payments across the platform.</p>
      </div>
      <PaymentHistoryTable scope="all" />
    </div>
  );
}