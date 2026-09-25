"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { isApiError } from "@/lib/apiClient";
import { useSendEmailOtp, useVerifyEmailOtp } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { otpSchema } from "@/validation";
import { OtpInput } from "@/components/ui/otp-input";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const verifyMutation = useVerifyEmailOtp();
  const resendMutation = useSendEmailOtp();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { otp: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);
      try {
        await verifyMutation.mutateAsync({ email, otp: value.otp });
        router.push("/");
        router.refresh();
      } catch (error) {
        setFormError(isApiError(error) ? error.message : "That code didn't work.");
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
        <h1 className="text-xl font-semibold">Verify your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="otp"
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
            Verify email
          </Button>
        )}
      </form.Subscribe>

      <button
        type="button"
        onClick={() => resendMutation.mutate({ email, type: "email-verification" })}
        disabled={resendMutation.isPending || resendMutation.isSuccess}
        className="interactive text-center text-sm text-primary hover:underline disabled:pointer-events-none disabled:opacity-60"
      >
        {resendMutation.isSuccess ? "Code resent" : "Resend code"}
      </button>
    </form>
  );
}