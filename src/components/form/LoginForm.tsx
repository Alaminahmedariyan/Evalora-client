"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "@tanstack/react-form";

import { authClient } from "@/lib/auth-client";
import { isApiError } from "@/lib/apiClient";
import { useLogin } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/validation";

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: { email: "", password: "" },

    onSubmit: async ({ value, formApi }) => {
      setFormError(null);

      const parsed = loginSchema.safeParse(value);
      if (!parsed.success) {
        void formApi.validateAllFields("submit");
        return;
      }

      try {
        const res = await loginMutation.mutateAsync(value);

        // Better Auth returns this shape (no user/token yet) when the
        // account has 2FA enabled — the custom REST layer doesn't wrap
        // 2FA verification, so we hand off to Better Auth's own client
        // for that one step (same exception as social login below).
        if (res.data?.twoFactorRedirect) {
          router.push("/two-factor");
          return;
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        setFormError(
          isApiError(error) ? error.message : "Couldn't log you in. Check your email and password.",
        );
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
        <h1 className="text-xl font-semibold">Log in to Evalora</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to continue.
        </p>
      </div>

      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => loginSchema.shape.email.safeParse(value).error?.issues[0]?.message,
          onBlur: ({ value }) => loginSchema.shape.email.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0 && field.state.meta.isTouched;
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
          onChange: ({ value }) => loginSchema.shape.password.safeParse(value).error?.issues[0]?.message,
          onBlur: ({ value }) => loginSchema.shape.password.safeParse(value).error?.issues[0]?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0 && field.state.meta.isTouched;
          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id={field.name}
                  name={field.name}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-error` : undefined}
                  placeholder="••••••••"
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

      <form.Subscribe selector={(state) => [state.isSubmitting, state.canSubmit] as const}>
        {([isSubmitting, canSubmit]) => (
          <Button type="submit" isLoading={isSubmitting} disabled={!canSubmit} className="w-full">
            Log in
          </Button>
        )}
      </form.Subscribe>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      {/*
        Social login intentionally bypasses our REST layer — OAuth is a
        browser-redirect protocol, not a JSON request/response cycle, and
        the callback URL registered with Google/GitHub points at Better
        Auth's own native route. authClient.signIn.social() is the correct,
        minimal way to kick that redirect off.
      */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => void authClient.signIn.social({ provider: "google", callbackURL: "/" })}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => void authClient.signIn.social({ provider: "github", callbackURL: "/" })}
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}