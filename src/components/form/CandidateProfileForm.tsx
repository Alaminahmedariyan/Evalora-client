
"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FileText, Globe, Upload } from "lucide-react";

import type { CandidateProfile } from "@/types";
import { useUpsertCandidateProfile } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { upsertProfileFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillsInput } from "@/components/module/candidate/SkillsInput";

export function CandidateProfileForm({
  profile,
}: {
  profile: CandidateProfile | null;
}) {
  const upsertMutation = useUpsertCandidateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const form = useForm({
    defaultValues: {
      headline: profile?.headline ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      location: profile?.location ?? "",
      linkedinUrl: profile?.linkedinUrl ?? "",
      githubUrl: profile?.githubUrl ?? "",
      portfolioUrl: profile?.portfolioUrl ?? "",
      experienceYears: profile?.experienceYears ?? 0,
    },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const parsed = upsertProfileFields.safeParse(value);

      if (!parsed.success) {
        setFormError(
          parsed.error.issues[0]?.message ??
            "Please check the form for errors.",
        );
        return;
      }

      try {
        await upsertMutation.mutateAsync({
          headline: value.headline || undefined,
          bio: value.bio || undefined,
          phone: value.phone || undefined,
          location: value.location || undefined,
          linkedinUrl: value.linkedinUrl || undefined,
          githubUrl: value.githubUrl || undefined,
          portfolioUrl: value.portfolioUrl || undefined,
          experienceYears: value.experienceYears || undefined,
          skills,
          resume: resumeFile ?? undefined,
        });

        notify.success("Profile saved");
      } catch (error) {
        const message = isApiError(error)
          ? error.message
          : "Couldn't save your profile.";

        setFormError(message);
        notify.error("Save failed", message);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-5"
      noValidate
    >
      {formError ? (
        <div
          role="alert"
          className="status-danger rounded-md border px-3 py-2 text-sm"
        >
          {formError}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Label
          htmlFor="resume"
          className="interactive inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          <Upload className="size-4" aria-hidden="true" />
          {resumeFile ? resumeFile.name : "Upload resume"}
        </Label>

        <input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) =>
            setResumeFile(e.target.files?.[0] ?? null)
          }
        />

        {profile?.resumeUrl && !resumeFile ? (
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <FileText className="size-3.5" aria-hidden="true" />
            Current resume
          </a>
        ) : null}
      </div>

      <form.Field name="headline">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Headline</Label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Full-stack developer"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="bio">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Bio</Label>
            <textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={3}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="location">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Location</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="experienceYears">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Years of experience</Label>
              <Input
                id={field.name}
                type="number"
                min={0}
                max={60}
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(Number(e.target.value))
                }
              />
            </div>
          )}
        </form.Field>
      </div>

      <SkillsInput value={skills} onChange={setSkills} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <form.Field name="linkedinUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-1.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM3.56 9h3.56v11.45H3.56V9z" />
                </svg>
                LinkedIn
              </Label>

              <Input
                id={field.name}
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="githubUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-1.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.17c-3.19.69-3.86-1.54-3.86-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.67 1.25 3.32.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
                </svg>
                GitHub
              </Label>

              <Input
                id={field.name}
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="portfolioUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor={field.name}
                className="flex items-center gap-1.5"
              >
                <Globe className="size-3.5" aria-hidden="true" />
                Portfolio
              </Label>

              <Input
                id={field.name}
                type="url"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="self-start"
          >
            Save profile
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
