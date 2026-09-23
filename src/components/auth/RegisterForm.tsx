"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { authClient } from "@/lib/auth-client";
import { registerFields, registerSchema } from "@/validation/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    onSubmit: async ({ value }) => {
      setFormError(null);

      const parsed = registerSchema.safeParse(value);

      if (!parsed.success) {
        return;
      }

      const { error } = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      });

      if (error) {
        setFormError(error.message ?? "Couldn't create your account.");
        return;
      }

      router.push(
        `/verify-email?email=${encodeURIComponent(value.email)}`,
      );
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
        <div
          role="alert"
          className="status-danger rounded-md border px-3 py-2 text-sm"
        >
          {formError}
        </div>
      ) : null}

      <form.Field
        name="name"
        validators={{
          onBlur: ({ value }) =>
            registerFields.shape.name.safeParse(value).error?.issues[0]
              ?.message,
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
                placeholder="Farhan Ahmed"
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
        name="email"
        validators={{
          onBlur: ({ value }) =>
            registerFields.shape.email.safeParse(value).error?.issues[0]
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
                aria-describedby={hasError ? `${field.name}-error` : undefined}
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
            registerFields.shape.password.safeParse(value).error?.issues[0]
              ?.message,
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Password</Label>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                placeholder="At least 8 characters"
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
        name="confirmPassword"
        validators={{
          onBlur: ({ value, fieldApi }) => {
            if (!value) {
              return "Please confirm your password.";
            }

            if (value !== fieldApi.form.getFieldValue("password")) {
              return "Passwords do not match.";
            }

            return undefined;
          },
        }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;

          return (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Confirm password</Label>

              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
                placeholder="Repeat your password"
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