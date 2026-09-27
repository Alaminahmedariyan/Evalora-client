import type { ResultStatus } from "@/types";

const CLASS_MAP: Record<ResultStatus, string> = {
  PENDING: "status-pending",
  PASSED: "status-passed",
  FAILED: "status-failed",
};

export function ResultStatusBadge({ status }: { status: ResultStatus }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${CLASS_MAP[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}