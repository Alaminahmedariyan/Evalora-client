"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { useSendContactMessage } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { CONTACT_MESSAGE_MAX, contactFormSchema } from "@/validation/contact.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Values = { name: string; email: string; subject: string; message: string; website: string };

const EMPTY: Values = { name: "", email: "", subject: "", message: "", website: "" };

const TEXTAREA_CLASS =
  "interactive w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ContactForm() {
  const sendMutation = useSendContactMessage();

  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function setField(field: keyof Values, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = contactFormSchema.safeParse(values);

    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});

    try {
      await sendMutation.mutateAsync({ ...parsed.data, website: values.website });
      setSentTo(parsed.data.email);
      setValues(EMPTY);
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "Couldn't send your message. Please try again.";
      setFormError(message);
      notify.error("Message not sent", message);
    }
  }

  if (sentTo) {
    return (
      <div className="card-evalora flex flex-col items-start gap-4 p-8" role="status">
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold">Message sent</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks for reaching out. We&apos;ll reply to {sentTo} by email.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSentTo(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  const remaining = CONTACT_MESSAGE_MAX - values.message.length;

  return (
    <form onSubmit={handleSubmit} className="card-evalora flex flex-col gap-5 p-6" noValidate>
      {formError ? (
        <div role="alert" className="status-danger rounded-md border px-3 py-2 text-sm">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p role="alert" className="text-xs text-danger">{errors.name}</p> : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email ? <p role="alert" className="text-xs text-danger">{errors.email}</p> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          value={values.subject}
          onChange={(e) => setField("subject", e.target.value)}
          aria-invalid={Boolean(errors.subject)}
        />
        {errors.subject ? <p role="alert" className="text-xs text-danger">{errors.subject}</p> : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          value={values.message}
          onChange={(e) => setField("message", e.target.value)}
          rows={7}
          className={TEXTAREA_CLASS}
          aria-invalid={Boolean(errors.message)}
        />
        <div className="flex items-start justify-between gap-4">
          {errors.message ? (
            <p role="alert" className="text-xs text-danger">{errors.message}</p>
          ) : (
            <span />
          )}
          <span className={remaining < 0 ? "text-xs text-danger" : "text-xs text-muted-foreground"}>
            {remaining} characters left
          </span>
        </div>
      </div>

      {/* Honeypot: invisible to people, tempting to bots. Do not remove. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <Button type="submit" isLoading={sendMutation.isPending} className="self-start">
        Send message
      </Button>
    </form>
  );
}