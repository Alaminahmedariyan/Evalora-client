"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Copy, ShieldCheck, ShieldOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useGetMe } from "@/hooks";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step =
  | "idle"
  | "password"
  | "scan"
  | "backup"
  | "disable"
  | "regenerate";

function secretFromUri(uri: string) {
  try {
    return new URL(uri).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

export function TwoFactorSetup() {
  const queryClient = useQueryClient();

  const { data } = useGetMe();

  const isEnabled = Boolean(
    (data?.data as { twoFactorEnabled?: boolean } | undefined)
      ?.twoFactorEnabled,
  );

  const [step, setStep] = useState<Step>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function reset() {
    setStep("idle");
    setPassword("");
    setCode("");
    setTotpURI("");
    setBackupCodes([]);
    setError(null);
  }

  // Better Auth returns { data, error } instead of throwing.
  // Only unexpected/network errors reach the catch block.
  async function run(task: () => Promise<void>) {
    setIsLoading(true);
    setError(null);

    try {
      await task();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEnable(e: React.FormEvent) {
    e.preventDefault();

    void run(async () => {
      const { data: result, error: failure } =
        await authClient.twoFactor.enable({
          password,
        });

      if (failure || !result) {
        setError(
          failure?.message ??
            "Couldn't start setup. Check your password and try again.",
        );
        return;
      }

      /*
       * Better Auth can return:
       *
       * { method: "otp" }
       *
       * OR
       *
       * {
       *   method: "totp",
       *   totpURI: string,
       *   backupCodes: string[]
       * }
       *
       * Therefore we must narrow the union before accessing
       * totpURI and backupCodes.
       */
      if (result.method !== "totp") {
        setError(
          "Two-factor authentication could not be configured with an authenticator app.",
        );
        return;
      }

      setTotpURI(result.totpURI);
      setBackupCodes(result.backupCodes ?? []);
      setPassword("");
      setStep("scan");
    });
  }

  function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    void run(async () => {
      const { error: failure } = await authClient.twoFactor.verifyTotp({
        code,
      });

      if (failure) {
        setError(
          failure.message ?? "That code didn't work. Check it and try again.",
        );
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["user", "me"],
      });

      notify.success("Two-factor authentication is on");

      setCode("");
      setStep("backup");
    });
  }

  function handleDisable(e: React.FormEvent) {
    e.preventDefault();

    void run(async () => {
      const { error: failure } = await authClient.twoFactor.disable({
        password,
      });

      if (failure) {
        setError(
          failure.message ??
            "Couldn't turn off two-factor authentication. Check your password.",
        );
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["user", "me"],
      });

      notify.success("Two-factor authentication is off");

      reset();
    });
  }

  function handleRegenerate(e: React.FormEvent) {
    e.preventDefault();

    void run(async () => {
      const { data: result, error: failure } =
        await authClient.twoFactor.generateBackupCodes({
          password,
        });

      if (failure || !result) {
        setError(
          failure?.message ??
            "Couldn't create new codes. Check your password.",
        );
        return;
      }

      setBackupCodes(result.backupCodes ?? []);
      setPassword("");
      setStep("backup");
    });
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));

      notify.success("Backup codes copied");
    } catch {
      notify.error(
        "Couldn't copy",
        "Select the codes and copy them manually.",
      );
    }
  }

  function passwordForm(
    onSubmit: (e: React.FormEvent) => void,
    submitLabel: string,
    note?: string,
  ) {
    return (
      <form
        onSubmit={onSubmit}
        className="flex max-w-sm flex-col gap-3"
        noValidate
      >
        {note ? (
          <p className="text-sm text-muted-foreground">
            {note}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="2fa-password">
            Confirm your password
          </Label>

          <Input
            id="2fa-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            size="sm"
            isLoading={isLoading}
            disabled={password.length === 0}
          >
            {submitLabel}
          </Button>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={reset}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  if (step === "password") {
    return passwordForm(
      handleEnable,
      "Continue",
      "You'll need an authenticator app such as Google Authenticator, Authy or 1Password. Social sign-in accounts without a password can't use two-factor authentication.",
    );
  }

  if (step === "disable") {
    return passwordForm(
      handleDisable,
      "Turn off two-factor authentication",
    );
  }

  if (step === "regenerate") {
    return passwordForm(
      handleRegenerate,
      "Create new codes",
      "Creating new codes makes your old backup codes stop working.",
    );
  }

  if (step === "scan") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm">
          Scan this QR code with your authenticator app, then
          enter the 6-digit code it shows. Two-factor
          authentication turns on only after you do.
        </p>

        <div className="flex flex-wrap items-center gap-5">
          <div className="rounded-md border border-border bg-white p-3">
            <QRCodeSVG
              value={totpURI}
              size={160}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Can&apos;t scan? Enter this key in your app:
            </p>

            <code className="mt-1 block break-all rounded bg-secondary px-2 py-1 text-foreground">
              {secretFromUri(totpURI)}
            </code>
          </div>
        </div>

        <form
          onSubmit={handleVerify}
          className="flex max-w-xs flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="2fa-code">
              6-digit code
            </Label>

            <Input
              id="2fa-code"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6),
                )
              }
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
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
              size="sm"
              isLoading={isLoading}
              disabled={code.length !== 6}
            >
              Verify and turn on
            </Button>

            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={reset}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === "backup") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Save these backup codes somewhere safe. Each one
          works once if you can&apos;t use your authenticator
          app. They won&apos;t be shown again.
        </p>

        <div className="card-evalora grid max-w-sm grid-cols-2 gap-2 p-4 font-mono text-sm">
          {backupCodes.map((backupCode) => (
            <span key={backupCode}>
              {backupCode}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => void copyCodes()}
          >
            <Copy
              className="size-3.5"
              aria-hidden="true"
            />
            Copy
          </Button>

          <Button
            size="sm"
            onClick={reset}
          >
            I&apos;ve saved them
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm">
        {isEnabled ? (
          <>
            <ShieldCheck
              className="size-4 text-success"
              aria-hidden="true"
            />
            Two-factor authentication is on
          </>
        ) : (
          <>
            <ShieldOff
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            Two-factor authentication is off
          </>
        )}
      </div>

      {isEnabled ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setStep("regenerate")}
          >
            New backup codes
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setStep("disable")}
          >
            Turn off
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          onClick={() => setStep("password")}
        >
          Turn on
        </Button>
      )}
    </div>
  );
}
