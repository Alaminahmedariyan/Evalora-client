"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { isApiError } from "@/lib/apiClient";
import { useResetPasswordWithOtp } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordFields, resetPasswordSchema } from "@/validation";
import { OtpInput } from "@/components/ui/otp-input";
import { notify } from "@/lib/toast";

export function ResetPasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const resetMutation = useResetPasswordWithOtp();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
onSubmit: async ({ value, formApi }) => {
  setFormError(null);
  const parsed = resetPasswordSchema.safeParse(value);
  if (!parsed.success) {
    void formApi.validateAllFields("submit");
    return;
  }

  try {
    await resetMutation.mutateAsync({ email, otp: value.otp, newPassword: value.newPassword });
    notify.success("Password updated!", "Please log in with your new password.");
    router.push("/login");
  } catch (error) {
    const message = isApiError(error) ? error.message : "Couldn't reset your password.";
    setFormError(message);
    notify.error("Reset failed", message);
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
        <h1 className="text-xl font-semibold">Enter your new password</h1>
        <p className="text-sm text-muted-foreground">
          Code sent to <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="otp"
        validators={{
          onBlur: ({ value }) => resetPasswordFields.shape.otp.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Reset code</Label>
              <OtpInput
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                invalid={hasError}
              />
              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="newPassword"
        validators={{
          onBlur: ({ value }) => resetPasswordFields.shape.newPassword.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>New password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                placeholder="At least 8 characters"
              />
              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="confirmPassword">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Confirm new password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Repeat your new password"
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Reset password
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}