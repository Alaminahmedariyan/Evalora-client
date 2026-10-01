import type { AuditAction } from "@/types";

// These don't map onto existing status/difficulty semantics (a CREATE
// isn't "success" or "failed") — a dedicated neutral-with-emphasis scheme,
// splitting only "destructive/security-sensitive" from "routine".
const SENSITIVE: AuditAction[] = ["DELETE", "ROLE_CHANGE", "SECURITY"];

export function AuditActionBadge({ action }: { action: AuditAction }) {
  const isSensitive = SENSITIVE.includes(action);
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
        isSensitive ? "status-danger" : "status-neutral"
      }`}
    >
      {action.replace(/_/g, " ")}
    </span>
  );
}