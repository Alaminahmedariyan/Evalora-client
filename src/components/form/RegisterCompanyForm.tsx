"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { useRegisterCompany } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { celebrate } from "@/lib/confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerCompanyFields } from "@/validation/company.validation";

export function RegisterCompanyForm() {
  const router = useRouter();
  const registerMutation = useRegisterCompany();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { name: "", description: "", website: "", industry: "" },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      const parsed = registerCompanyFields.safeParse(value);
      if (!parsed.success) {
        void formApi.validateAllFields("submit");
        return;
      }

      try {
        await registerMutation.mutateAsync({
          name: value.name,
          // Convert empty-string optional fields back to undefined so the
          // backend's .optional() fields are omitted rather than sent as "".
          description: value.description || undefined,
          website: value.website || undefined,
          industry: value.industry || undefined,
        });

        celebrate();
        notify.success("Company registered!", "Awaiting admin verification — you're now a Recruiter.");
        router.push("/recruiter");
        router.refresh();
      } catch (error) {
        const message = isApiError(error) ? error.message : "Couldn't register your company.";
        setFormError(message);
        notify.error("Registration failed", message);
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
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold">Register your company</h1>
        <p className="text-sm text-muted-foreground">
          This upgrades your account to Recruiter so you can create assessments and invite candidates.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="name"
        validators={{
          onBlur: ({ value }) => registerCompanyFields.shape.name.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Company name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                placeholder="Acme Inc."
              />
              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="website"
        validators={{
          onBlur: ({ value }) =>
            value ? registerCompanyFields.shape.website.safeParse(value).error?.issues[0]?.message : undefined,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Website</Label>
              <Input
                id={field.name}
                name={field.name}
                type="url"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                placeholder="https://example.com"
              />
              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
              <p className="text-xs text-muted-foreground">Optional</p>
            </div>
          );
        }}
      </form.Field>

      <form.Field name="industry">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Industry</Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Software Development"
            />
            <p className="text-xs text-muted-foreground">Optional</p>
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
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              rows={4}
              className="interactive flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="What does your company do?"
            />
            <p className="text-xs text-muted-foreground">Optional, up to 2000 characters</p>
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Register company
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}