import { cn } from "@/lib/utils";

const STATUS_CLASS_MAP: Record<string, string> = {
  DRAFT: "status-neutral",
  PUBLISHED: "status-published",
  ACTIVE: "status-active",
  CLOSED: "status-danger",
  ARCHIVED: "status-archived",
  NOT_STARTED: "status-neutral",
  IN_PROGRESS: "status-active",
  SUBMITTED: "status-submitted",
  AUTO_SUBMITTED: "status-auto-submitted",
  EVALUATED: "status-evaluated",
  EXPIRED: "status-expired",
};

export function BreakdownBadges({ data, useStatusColors }: { data: Record<string, number>; useStatusColors?: boolean }) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {entries.map(([key, count]) => (
        <span
          key={key}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            useStatusColors ? STATUS_CLASS_MAP[key] ?? "status-neutral" : "status-neutral",
          )}
        >
          {key.replace(/_/g, " ")}
          <span className="stat-number">{count}</span>
        </span>
      ))}
    </div>
  );
}