"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { isApiError } from "@/lib/apiClient";
import { useRegister } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerFields, registerSchema } from "@/validation";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },

    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      const parsed = registerSchema.safeParse(value);
      if (!parsed.success) {
        void formApi.validateAllFields("submit");
        return;
      }

      try {
        // Backend's Better Auth config has emailVerification.sendOnSignUp:
        // true, so the verification OTP is already sent as a side effect
        // of this call — no separate sendEmailOtp() needed here.
        await registerMutation.mutateAsync({
          name: value.name,
          email: value.email,
          password: value.password,
        });

        router.push(`/verify-email?email=${encodeURIComponent(value.email)}`);
      } catch (error) {
        setFormError(isApiError(error) ? error.message : "Couldn't create your account.");
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
        <h1 className="text-xl font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start as a candidate — you can register a company later to hire.
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
          onBlur: ({ value }) => registerFields.shape.name.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Full name</Label>
              <Input
                id={field.name}
                name={field.name}
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                placeholder="Enter your name"
              />
              {hasError ? (
                <p id={`${field.name}-error`} className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) => registerFields.shape.email.safeParse(value).error?.issues[0]?.message,
        }}
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
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                placeholder="you@company.com"
              />
              {hasError ? (
                <p id={`${field.name}-error`} className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onBlur: ({ value }) => registerFields.shape.password.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Password</Label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                  placeholder="At least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {hasError ? (
                <p id={`${field.name}-error`} className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="confirmPassword"
        validators={{
          onBlur: ({ value, fieldApi }) => {
            if (!value) return "Please confirm your password.";
            if (value !== fieldApi.form.getFieldValue("password")) return "Passwords do not match.";
            return undefined;
          },
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Confirm password</Label>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                  placeholder="Repeat your password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {hasError ? (
                <p id={`${field.name}-error`} className="text-xs text-danger">
                  {String(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit] as const}>
        {([isSubmitting, canSubmit]) => (
          <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit} className="w-full">
            Create account
          </Button>
        )}
      </form.Subscribe>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}