import { PaymentHistoryTable } from "@/components/module/payment";

export default function RecruiterPaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">Your company&apos;s payment history.</p>
      </div>
      <PaymentHistoryTable scope="me" />
    </div>
  );
}