"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ImagePlus } from "lucide-react";

import type { Company } from "@/types";
import { useUpdateMyCompany } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage, initialsFromName } from "@/components/ui/avatar";

export function UpdateCompanyForm({ company, onSaved }: { company: Company; onSaved?: () => void }) {
  const updateMutation = useUpdateMyCompany();
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      description: company.description ?? "",
      website: company.website ?? "",
      industry: company.industry ?? "",
    },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await updateMutation.mutateAsync({
          description: value.description || undefined,
          website: value.website || undefined,
          industry: value.industry || undefined,
          logo: logoFile ?? undefined,
        });
        notify.success("Company profile updated");
        onSaved?.();
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't update your company profile.";
        setFormError(message);
        notify.error("Update failed", message);
      }
    },
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

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

      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={logoPreview ?? company.logo ?? undefined} alt={company.name} />
          <AvatarFallback className="text-lg">{initialsFromName(company.name)}</AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="logo" className="interactive inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">
            <ImagePlus className="size-4" aria-hidden="true" />
            Change logo
          </Label>
          <input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, up to a few MB.</p>
        </div>
      </div>

      <form.Field name="website">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Website</Label>
            <Input
              id={field.name}
              name={field.name}
              type="url"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="industry">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Industry</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Software Development"
            />
          </div>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Description</Label>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="What does your company do?"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="self-start">
            Save changes
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}