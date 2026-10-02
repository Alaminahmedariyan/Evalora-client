"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Eye, EyeOff } from "lucide-react";

import { useChangePassword } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { changePasswordFields } from "@/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword();
  const [formError, setFormError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      const parsed = changePasswordFields.safeParse(value);

      if (!parsed.success) {
        setFormError(
          parsed.error.issues[0]?.message ??
            "Please check the form for errors.",
        );
        void formApi.validateAllFields("submit");
        return;
      }

      try {
        await changePasswordMutation.mutateAsync({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
        });

        notify.success("Password changed");
        formApi.reset();
      } catch (error) {
        const message = isApiError(error)
          ? error.message
          : "Couldn't change your password.";

        setFormError(message);
        notify.error("Change failed", message);
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
      className="flex flex-col gap-4"
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

      <form.Field name="currentPassword">
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Current password</Label>
            <Input
              id={field.name}
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      </form.Field>

      <form.Field name="newPassword">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>New password</Label>

                <button
                  type="button"
                  onClick={() => setShow((value) => !value)}
                  className="interactive flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-3.5" aria-hidden="true" />
                  )}
                  {show ? "Hide" : "Show"}
                </button>
              </div>

              <Input
                id={field.name}
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                placeholder="At least 8 characters"
              />

              {hasError ? (
                <p className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field name="confirmNewPassword">
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Confirm new password</Label>

              <Input
                id={field.name}
                type={show ? "text" : "password"}
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
              />

              {hasError ? (
                <p className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="self-start"
          >
            Change password
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}