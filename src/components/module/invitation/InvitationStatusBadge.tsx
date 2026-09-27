import type { InvitationStatus } from "@/types";

// PENDING/ACCEPTED/DECLINED/EXPIRED/COMPLETED already map onto the
// success/danger/pending/expired groups bundled in globals.css — no new
// CSS needed, just the right class name per value.
const CLASS_MAP: Record<InvitationStatus, string> = {
  PENDING: "status-pending",
  ACCEPTED: "status-accepted",
  DECLINED: "status-declined",
  EXPIRED: "status-expired",
  COMPLETED: "status-completed",
};

export function InvitationStatusBadge({ status }: { status: InvitationStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CLASS_MAP[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}