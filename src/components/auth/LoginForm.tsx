"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    onSubmit: async ({ value }) => {
      setFormError(null); 

      const { error } = await authClient.signIn.email({
        email: value.email,
        password: value.password,
      });

      if (error) {
        if (
          (error as { code?: string }).code === "TWO_FACTOR_REQUIRED"
        ) {
          router.push("/two-factor");
          return;
        }

        setFormError(
          error.message ??
            "Couldn't log you in. Check your email and password.",
        );
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
        <h1 className="text-xl font-semibold">Log in to Evalora</h1>

        <p className="text-sm text-muted-foreground">
          Enter your email and password to continue.
        </p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="status-danger rounded-md border px-3 py-2 text-sm"
        >
          {formError}
        </div>
      ) : null}

      <form.Field
        name="email"
        validators={{
          onBlur: ({ value }) =>
            loginSchema.shape.email.safeParse(value).error?.issues[0]
              ?.message,
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
                aria-describedby={
                  hasError ? `${field.name}-error` : undefined
                }
                placeholder="you@company.com"
              />

              {hasError ? (
                <p
                  id={`${field.name}-error`}
                  className="text-xs text-danger"
                >
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
          onBlur: ({ value }) =>
            loginSchema.shape.password.safeParse(value).error?.issues[0]
              ?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name}>Password</Label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={
                  hasError ? `${field.name}-error` : undefined
                }
                placeholder="••••••••"
              />

              {hasError ? (
                <p
                  id={`${field.name}-error`}
                  className="text-xs text-danger"
                >
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
            className="w-full"
          >
            Log in
          </Button>
        )}
      </form.Subscribe>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void authClient.signIn.social({
              provider: "google",
              callbackURL: "/",
            })
          }
        >
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            void authClient.signIn.social({
              provider: "github",
              callbackURL: "/",
            })
          }
        >
          GitHub
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary hover:underline"
        >
          Register
        </Link>
      </p>
    </form>
  );
}