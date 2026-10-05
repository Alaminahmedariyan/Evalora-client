"use client";

import { Eye, EyeOff } from "lucide-react";

import type { CandidateProfile } from "@/types";
import { useUpsertCandidateProfile } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileVisibilityCard({ profile }: { profile: CandidateProfile | null }) {
  const mutation = useUpsertCandidateProfile();

  // Without a saved profile there is nothing to show or hide yet.
  const hasProfile = profile !== null;

  // Show the value being saved straight away, instead of waiting for the
  // refetch, so the switch never feels stuck.
  const pending = mutation.isPending ? mutation.variables?.isVisibleToRecruiters : undefined;
  const visible = pending ?? profile?.isVisibleToRecruiters ?? true;

  async function handleChange(next: boolean) {
    try {
      await mutation.mutateAsync({ isVisibleToRecruiters: next });
      notify.success(
        next ? "Your profile is visible to recruiters" : "Your profile is now hidden from recruiters",
      );
    } catch (error) {
      notify.error("Couldn't update visibility", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {visible ? (
            <Eye className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <EyeOff className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          Visibility to recruiters
        </CardTitle>
        <CardDescription>
          When this is on, recruiters registered on Evalora can find your profile and see your name,
          email, phone number, résumé and links. Turning it off does not hide your results from a
          company that has invited you to an assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="profile-visibility" className="text-sm">
            {visible ? "Visible to recruiters" : "Hidden from recruiters"}
          </label>
          <Switch
            id="profile-visibility"
            checked={visible}
            onCheckedChange={(checked) => void handleChange(checked)}
            disabled={!hasProfile || mutation.isPending}
          />
        </div>
        {!hasProfile ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Save your profile first, then you can choose who can see it.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}