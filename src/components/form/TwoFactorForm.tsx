"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";

import { getMe } from "@/api";
import { authClient } from "@/lib/auth-client";
import { dashboardPathFor } from "@/lib/dashboard-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { otpSchema } from "@/validation";

// Not wrapped by the custom REST layer (the backend's auth.routes.ts has no
// two-factor routes) — same exception as social login, so this one screen
// talks to Better Auth's own client directly.
export function TwoFactorForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [useBackup, setUseBackup] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const form = useForm({
    defaultValues: { code: "" },
    onSubmit: async ({ value }) => {
      setFormError(null);

      const code = value.code.trim();

      if (useBackup ? code.length === 0 : !otpSchema.safeParse(code).success) {
        setFormError(
          useBackup
            ? "Enter one of your backup codes."
            : "Enter the 6-digit code from your authenticator app.",
        );
        return;
      }

      const { error } = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice })
        : await authClient.twoFactor.verifyTotp({ code, trustDevice });

      if (error) {
        if (error.code === "INVALID_TWO_FACTOR_COOKIE") {
          setExpired(true);
          return;
        }

        setFormError(error.message ?? "That code didn't work. Check it and try again.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      let destination = "/";

      try {
        const me = await getMe();
        destination = dashboardPathFor(me.data.role);
      } catch {
        // Signed in but the profile call failed: the home page still works.
      }

      router.push(destination);
      router.refresh();
    },
  });

  if (expired) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Sign-in expired</h1>
        <p className="text-sm text-muted-foreground">
          You waited too long to enter your code. Log in again to get a new chance.
        </p>
        <Button asChild>
          <Link href="/login">Back to log in</Link>
        </Button>
      </div>
    );
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
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold">Two-factor verification</h1>
        <p className="text-sm text-muted-foreground">
          {useBackup
            ? "Enter one of your backup codes to finish logging in."
            : "Enter the 6-digit code from your authenticator app to finish logging in."}
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="code"
        validators={
          useBackup
            ? undefined
            : { onBlur: ({ value }) => otpSchema.safeParse(value).error?.issues[0]?.message }
        }
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>{useBackup ? "Backup code" : "Verification code"}</Label>

              {useBackup ? (
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  autoComplete="off"
                  placeholder="xxxxx-xxxxx"
                />
              ) : (
                <OtpInput
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  invalid={hasError}
                />
              )}

              {hasError ? <p className="text-xs text-danger">{String(field.state.meta.errors[0])}</p> : null}
            </div>
          );
        }}
      </form.Field>

      <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
          className="size-4 cursor-pointer accent-primary"
        />
        Trust this device for 30 days
      </label>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" isLoading={isSubmitting} className="w-full">
            Verify
          </Button>
        )}
      </form.Subscribe>

      <button
        type="button"
        className="interactive text-xs text-muted-foreground hover:text-primary"
        onClick={() => {
          setUseBackup((value) => !value);
          setFormError(null);
          form.reset();
        }}
      >
        {useBackup ? "Use my authenticator app instead" : "Use a backup code instead"}
      </button>
    </form>
  );
}