"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";

import { useDeleteMyAccount, useGetMe } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccountCard() {
  const { data } = useGetMe();
  const user = data?.data;

  const deleteMutation = useDeleteMyAccount();

  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!user || user.role === "ADMIN") return null;

  if (user.role === "RECRUITER") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Delete account</CardTitle>
          <CardDescription>
            Company accounts can&apos;t be deleted from here yet.{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>{" "}
            and we will help.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const matches = confirmEmail.trim().toLowerCase() === user.email.toLowerCase();

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await deleteMutation.mutateAsync({ confirmEmail });
      notify.success("Your account has been deleted");
      window.location.assign("/");
    } catch (err) {
      setError(isApiError(err) ? err.message : "Couldn't delete your account. Please try again.");
    }
  }

  return (
    <Card className="border-danger/30">
      <CardHeader>
        <CardTitle className="text-danger">Delete account</CardTitle>
        <CardDescription>
          You will be signed out everywhere and will no longer be able to log in, and your profile
          will disappear from the recruiter directory. Results already shared with a company, and
          payment and security records, may be kept as described in our{" "}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
          . You won&apos;t be able to register again with the same email address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {open ? (
          <form onSubmit={handleDelete} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delete-confirm-email">
                Type your email address ({user.email}) to confirm
              </Label>
              <Input
                id="delete-confirm-email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            {error ? (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={!matches}
                isLoading={deleteMutation.isPending}
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Delete my account
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setConfirmEmail("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Delete my account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}