import { CalendarClock, Clock, Flag, Hash, ShieldAlert, Target, type LucideIcon } from "lucide-react";

import type { AttemptDetail, AttemptStatus, Result } from "@/types";
import { ResultStatusBadge } from "@/components/module/result";

const STATUS_BADGE: Record<AttemptStatus, { label: string; className: string }> = {
  NOT_STARTED: { label: "Not started", className: "status-neutral" },
  IN_PROGRESS: { label: "In progress", className: "status-in-progress" },
  SUBMITTED: { label: "Submitted", className: "status-submitted" },
  AUTO_SUBMITTED: { label: "Auto-submitted", className: "status-auto-submitted" },
  EVALUATED: { label: "Evaluated", className: "status-evaluated" },
  EXPIRED: { label: "Expired", className: "status-expired" },
};

function formatDuration(startedAt: string | null, submittedAt: string | null) {
  if (!startedAt || !submittedAt) return "—";

  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.max(1, Math.round(ms / 60000));

  return `${minutes} min`;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function Tile({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background/60 p-4">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      <span className="stat-number text-sm font-semibold">{children}</span>
    </div>
  );
}

export function AttemptSummaryCard({ attempt, result }: { attempt: AttemptDetail; result?: Result | null }) {
  const badge = STATUS_BADGE[attempt.status];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Tile icon={Flag} label="Status">
        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badge.className}`}>{badge.label}</span>
      </Tile>

      <Tile icon={Hash} label="Attempt">
        #{attempt.attemptNumber}
      </Tile>

      <Tile icon={Target} label="Result">
        {result ? (
          <span className="flex flex-wrap items-center gap-2">
            {result.totalScore}/{result.totalMarks}
            <ResultStatusBadge status={result.status} />
          </span>
        ) : (
          <span className="font-normal text-muted-foreground">Not available yet</span>
        )}
      </Tile>

      <Tile icon={CalendarClock} label="Started">
        {formatDateTime(attempt.startedAt)}
      </Tile>

      <Tile icon={CalendarClock} label="Submitted">
        {formatDateTime(attempt.submittedAt)}
      </Tile>

      <Tile icon={Clock} label="Time taken">
        {formatDuration(attempt.startedAt, attempt.submittedAt)}
      </Tile>

      <div className="col-span-2 sm:col-span-3">
        {attempt.tabSwitchCount > 0 ? (
          <span className="proctor-warning inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <ShieldAlert className="size-3.5" aria-hidden="true" />
            {attempt.tabSwitchCount} tab switch{attempt.tabSwitchCount === 1 ? "" : "es"} recorded
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">No tab switches recorded.</span>
        )}
      </div>
    </div>
  );
}