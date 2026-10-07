"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";

import { useAllPayments, useMyPayments } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TablePagination } from "@/components/ui/table-pagination";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

const skeletonItems = [
  "payment-skeleton-1",
  "payment-skeleton-2",
  "payment-skeleton-3",
  "payment-skeleton-4",
];

function formatAmount(amountMinor: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinor / 100);
}

export function PaymentHistoryTable({ scope }: { scope: "me" | "all" }) {
  const [page, setPage] = useState(1);
  const useQuery = scope === "me" ? useMyPayments : useAllPayments;
  const { data, isPending, isError } = useQuery({ page, limit: 10 });

  if (isPending) {
    return (
      <div className="flex flex-col gap-2">
        {skeletonItems.map((id) => (
          <Skeleton key={id} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="status-danger rounded-md border px-4 py-3 text-sm">
        Couldn&apos;t load payments.
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <EmptyState
        icon={Receipt}
        title="No payments yet"
        description="Payment history will show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="card-evalora overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.data.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>

                <td className="stat-number px-4 py-3">
                  {formatAmount(
                    payment.amountMinor,
                    payment.currency,
                  )}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {payment.provider}
                </td>

                <td className="px-4 py-3">
                  <PaymentStatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        page={data.meta?.page ?? page}
        totalPages={data.meta?.totalPage ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}