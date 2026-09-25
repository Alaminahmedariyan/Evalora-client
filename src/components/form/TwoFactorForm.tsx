"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { otpSchema } from "@/validation";
import { OtpInput } from "@/components/ui/otp-input";

// Not wrapped by the custom REST layer (backend's auth.routes.ts has no
// /two-factor/* route) — same exception as social login, so this one
// screen talks to Better Auth's own client directly.
export function TwoFactorForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const { error } = await authClient.twoFactor.verifyOtp({ code: value.code });

      if (error) {
        setFormError(error.message ?? "That code didn't work. Check it and try again.");
        return;
      }

      router.push("/");
      router.refresh();
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
        <h1 className="text-xl font-semibold">Two-factor verification</h1>
        <p className="text-sm text-muted-foreground">Enter the 6-digit code to finish logging in.</p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="code"
        validators={{ onBlur: ({ value }) => otpSchema.safeParse(value).error?.issues[0]?.message }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Verification code</Label>
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

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Verify
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}