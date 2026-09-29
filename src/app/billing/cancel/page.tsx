import Link from "next/link";
import { XCircle } from "lucide-react";

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <XCircle className="size-10 text-muted-foreground" aria-hidden="true" />
      <p className="text-lg font-semibold">Checkout cancelled</p>
      <p className="text-sm text-muted-foreground">No charge was made. You can restart checkout anytime.</p>
      <Link href="/recruiter/subscription" className="text-sm text-primary hover:underline">
        Back to subscription
      </Link>
    </div>
  );
}