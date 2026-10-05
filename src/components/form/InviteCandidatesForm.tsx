"use client";

import { useRef, useState } from "react";
import { UserPlus } from "lucide-react";

import { useInviteCandidates } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { newIdempotencyKey } from "@/lib/idempotency";
import { notify } from "@/lib/toast";
import { inviteCandidatesSchema } from "@/validation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
  const [raw, setRaw] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const idempotencyKeyRef = useRef(newIdempotencyKey());

  const inviteMutation = useInviteCandidates(assessmentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const emails = parseEmails(raw);
    const parsed = inviteCandidatesSchema.safeParse({ emails });

    if (!parsed.success) {
      setFormError(
        parsed.error.issues[0]?.message ?? "Please check the email list.",
      );
      return;
    }

    try {
      const res = await inviteMutation.mutateAsync({
        payload: { emails },
        idempotencyKey: idempotencyKeyRef.current,
      });

      const { invited, skipped } = res.data;

      notify.success(
        `${invited} candidate${invited === 1 ? "" : "s"} invited`,
        skipped
          ? `${skipped} were already invited to this assessment.`
          : undefined,
      );

      setRaw("");
      setOpen(false);
      idempotencyKeyRef.current = newIdempotencyKey();
      onInvited?.();
    } catch (error) {
      // The server answered, so this request is settled: the next try is a new
      // action and needs a new key. Keeping the old one would replay this
      // error, or clash with an edited email list. Only a network failure or
      // a 5xx keeps the key, so a retry stays safe against duplicates.
      if (isApiError(error) && error.statusCode < 500) {
        idempotencyKeyRef.current = newIdempotencyKey();
      }

      const message = isApiError(error)
        ? error.message
        : "Couldn't send invitations.";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="card-evalora flex flex-col gap-3 p-4"
    >
      <Label htmlFor="invite-emails">Candidate emails</Label>

      <textarea
        id="invite-emails"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={4}
        className="interactive w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={
          "One email per line, or comma-separated\ncandidate1@example.com\ncandidate2@example.com"
        }
      />

      {formError ? (
        <p className="text-xs text-danger">{formError}</p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          isLoading={inviteMutation.isPending}
        >
          Send invitations
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}