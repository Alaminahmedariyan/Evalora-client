"use client";

import { useRef, useState } from "react";
import { UserPlus, X } from "lucide-react";

import { useInviteCandidates, useMySubscription } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { readPlanInfo } from "@/lib/plan-info";
import { notify } from "@/lib/toast";
import { inviteCandidatesSchema } from "@/validation";
import { CandidatePicker, type PickedCandidate } from "@/components/module/invitation/CandidatePicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "pick" | "paste";

// The backend accepts at most this many emails in one request.
const MAX_PER_REQUEST = 100;

const EXPIRY_OPTIONS = [3, 7, 14, 30];

function parseEmails(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[\n,]/)
        .map((e) => e.trim())
        .filter(Boolean),
    ),
  );
}

export function InviteCandidatesForm({
  assessmentId,
  onInvited,
}: {
  assessmentId: string;
  onInvited?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("pick");
  const [selected, setSelected] = useState<Map<string, PickedCandidate>>(() => new Map());
  const [raw, setRaw] = useState("");
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [formError, setFormError] = useState<string | null>(null);

  const idempotencyKeyRef = useRef(newIdempotencyKey());

  const inviteMutation = useInviteCandidates(assessmentId);

  // How many invitations the plan still allows. null means no known limit
  // (unlimited plan, or the plan could not be read; the server still checks).
  const { data: subscriptionRes } = useMySubscription();
  const planInfo = readPlanInfo(subscriptionRes?.data);
  const limit = planInfo?.limits.maxInvitationsPer30Days ?? null;
  const remaining =
    planInfo && limit !== null ? Math.max(limit - planInfo.usage.invitationsLast30Days, 0) : null;
  const maxSelectable = Math.min(remaining ?? MAX_PER_REQUEST, MAX_PER_REQUEST);

  function close() {
    setOpen(false);
    setSelected(new Map());
    setRaw("");
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const emails = mode === "pick" ? Array.from(selected.keys()) : parseEmails(raw);

    if (mode === "pick" && emails.length === 0) {
      setFormError("Select at least one candidate.");
      return;
    }

    const parsed = inviteCandidatesSchema.safeParse({ emails, expiresInDays });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Please check the email list.");
      return;
    }

    try {
      const res = await inviteMutation.mutateAsync({
        payload: { emails, expiresInDays },
        idempotencyKey: idempotencyKeyRef.current,
      });

      const { invited, skipped } = res.data;

      notify.success(
        `${invited} candidate${invited === 1 ? "" : "s"} invited`,
        skipped ? `${skipped} were already invited to this assessment.` : "They've been notified.",
      );

      close();
      idempotencyKeyRef.current = newIdempotencyKey();
      onInvited?.();
    } catch (error) {
      // The server answered, so this request is settled: the next try is a new
      // action and needs a new key. Keeping the old one would replay this
      // error, or clash with an edited list. Only a network failure or a 5xx
      // keeps the key, so a retry stays safe against duplicates.
      if (isApiError(error) && error.statusCode < 500) {
        idempotencyKeyRef.current = newIdempotencyKey();
      }

      const message = isApiError(error) ? error.message : "Couldn't send invitations.";

      setFormError(message);
      notify.error("Invite failed", message);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden="true" />
        Invite candidates
      </Button>
    );
  }

  const selectedCount = selected.size;
  const limitReached = remaining !== null && selectedCount >= remaining;

  return (
    <form onSubmit={handleSubmit} className="card-evalora flex w-full flex-col gap-4 p-4 md:p-5" noValidate>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Invite candidates</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {remaining === null
              ? "Candidates with an account get a notification and an email."
              : `You can send ${remaining} more invitation${remaining === 1 ? "" : "s"} on your plan (limit ${limit} per 30 days).`}
          </p>
        </div>

        <button
          type="button"
          onClick={close}
          className="interactive rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          aria-label="Close invite form"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as Mode);
          setFormError(null);
        }}
      >
        <TabsList>
          <TabsTrigger value="pick">Pick candidates</TabsTrigger>
          <TabsTrigger value="paste">Paste emails</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "pick" ? (
        <CandidatePicker
          assessmentId={assessmentId}
          selected={selected}
          onChange={setSelected}
          maxSelectable={maxSelectable}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invite-emails">Candidate emails</Label>

          <textarea
            id="invite-emails"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={5}
            className="interactive w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder={"One email per line, or comma-separated\ncandidate1@example.com\ncandidate2@example.com"}
          />

          <p className="text-xs text-muted-foreground">
            Use this for people who aren&apos;t in the list, for example candidates who haven&apos;t registered yet.
          </p>
        </div>
      )}

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="invite-expiry" className="text-xs text-muted-foreground">
            Expires in
          </Label>
          <select
            id="invite-expiry"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
          >
            {EXPIRY_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days} days
              </option>
            ))}
          </select>
        </div>

        {mode === "pick" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="stat-number font-medium">{selectedCount} selected</span>

            {selectedCount > 0 ? (
              <button
                type="button"
                onClick={() => setSelected(new Map())}
                className="interactive text-primary hover:underline"
              >
                Clear
              </button>
            ) : null}

            {limitReached ? <span className="text-warning">Plan limit reached</span> : null}
          </div>
        ) : null}

        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={close}>
            Cancel
          </Button>

          <Button
            type="submit"
            size="sm"
            isLoading={inviteMutation.isPending}
            disabled={mode === "pick" && selectedCount === 0}
          >
            {mode === "pick" && selectedCount > 0
              ? `Send ${selectedCount} invitation${selectedCount === 1 ? "" : "s"}`
              : "Send invitations"}
          </Button>
        </div>
      </div>
    </form>
  );
}