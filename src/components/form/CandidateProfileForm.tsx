"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { FileText, Github, Globe, Linkedin, Upload } from "lucide-react";

import type { CandidateProfile } from "@/types";
import { useUpsertCandidateProfile } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { upsertProfileFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillsInput } from "@/components/module/candidate/SkillsInput";

export function CandidateProfileForm({ profile }: { profile: CandidateProfile | null }) {
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
        setFormError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
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
        const message = isApiError(error) ? error.message : "Couldn't save your profile.";
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
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <Label htmlFor="resume" className="interactive inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">
          <Upload className="size-4" aria-hidden="true" />
          {resumeFile ? resumeFile.name : "Upload resume"}
        </Label>
        <input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
        />
        {profile?.resumeUrl && !resumeFile ? (
          <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
            <FileText className="size-3.5" aria-hidden="true" />
            Current resume
          </a>
        ) : null}
      </div>

      <form.Field name="headline">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Headline</Label>
            <Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Full-stack developer" />
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
              <Input id={field.name} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} placeholder="Dhaka, Bangladesh" />
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
                onChange={(e) => field.handleChange(Number(e.target.value))}
              />
            </div>
          )}
        </form.Field>
      </div>

      <SkillsInput value={skills} onChange={setSkills} />

      <div className="grid grid-cols-3 gap-4">
        <form.Field name="linkedinUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="flex items-center gap-1.5">
                <Linkedin className="size-3.5" aria-hidden="true" />
                LinkedIn
              </Label>
              <Input id={field.name} type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        </form.Field>
        <form.Field name="githubUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="flex items-center gap-1.5">
                <Github className="size-3.5" aria-hidden="true" />
                GitHub
              </Label>
              <Input id={field.name} type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        </form.Field>
        <form.Field name="portfolioUrl">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name} className="flex items-center gap-1.5">
                <Globe className="size-3.5" aria-hidden="true" />
                Portfolio
              </Label>
              <Input id={field.name} type="url" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Save profile
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}