"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

import { useSendEmailOtp } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emailSchema = z.string().min(1, "Email is required").email("Enter a valid email");

export function ForgotPasswordForm() {
  const router = useRouter();
  const sendOtpMutation = useSendEmailOtp();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await sendOtpMutation.mutateAsync({ email: value.email, type: "forget-password" });
        router.push(`/reset-password?email=${encodeURIComponent(value.email)}`);
      } catch {
        // Deliberately vague — don't reveal whether the email exists.
        setFormError("Couldn't send the code. Please try again in a moment.");
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
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="email"
        validators={{ onBlur: ({ value }) => emailSchema.safeParse(value).error?.issues[0]?.message }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Email</Label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                placeholder="you@company.com"
              />
              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Send reset code
          </Button>
        )}
      </form.Subscribe>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <a href="/login" className="text-primary hover:underline">
          Log in
        </a>
      </p>
    </form>
  );
}