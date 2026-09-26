import type { AssessmentStatus } from "@/types";

// Kept consistent with the mapping already established in
// components/module/admin/BreakdownBadges.tsx — don't invent a second
// mapping for the same enum.
const CLASS_MAP: Record<AssessmentStatus, string> = {
  DRAFT: "status-neutral",
  PUBLISHED: "status-published",
  ACTIVE: "status-active",
  CLOSED: "status-danger",
  ARCHIVED: "status-archived",
};

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CLASS_MAP[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}