import { Clock, Mail } from "lucide-react";

import type { AttemptDetail } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

function formatDuration(startedAt: string | null, submittedAt: string | null) {
  if (!startedAt || !submittedAt) return "—";
  const ms = new Date(submittedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.round(ms / 60000);
  return `${minutes} min`;
}

export function AttemptSummaryCard({ attempt }: { attempt: AttemptDetail }) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-6 p-5 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-4" aria-hidden="true" />
          {formatDuration(attempt.startedAt, attempt.submittedAt)}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Mail className="size-4" aria-hidden="true" />
          Attempt #{attempt.attemptNumber}
        </div>
        {attempt.tabSwitchCount > 0 ? (
          <span className="proctor-warning rounded-full border px-2.5 py-1 text-xs font-medium">
            {attempt.tabSwitchCount} tab switch{attempt.tabSwitchCount === 1 ? "" : "es"}
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}