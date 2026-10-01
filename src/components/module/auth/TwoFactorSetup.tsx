"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { useGetMe } from "@/hooks";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TwoFactorSetup() {
  const { data } = useGetMe();
  const [step, setStep] = useState<"idle" | "confirm-password" | "show-codes">("idle");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // NOTE: not fully verified against the installed better-auth version's
  // actual return shape — test this and adjust if `backupCodes` comes back
  // under a different key.
  async function handleEnable() {
    setIsLoading(true);
    try {
      const result = await authClient.twoFactor.enable({ password });
      const codes = (result as { data?: { backupCodes?: string[] } })?.data?.backupCodes;
      setBackupCodes(codes ?? []);
      setStep("show-codes");
      notify.success("Two-factor authentication enabled");
    } catch {
      notify.error("Couldn't enable 2FA", "Check your password and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDisable() {
    if (!window.confirm("Disable two-factor authentication? This makes your account less secure.")) return;
    setIsLoading(true);
    try {
      await authClient.twoFactor.disable({ password });
      notify.success("Two-factor authentication disabled");
      setStep("idle");
      setPassword("");
    } catch {
      notify.error("Couldn't disable 2FA", "Check your password and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const isEnabled = Boolean((data?.data as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled);

  if (step === "show-codes" && backupCodes) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">Save these backup codes somewhere safe — each can be used once if you lose access to your email.</p>
        <div className="card-evalora grid grid-cols-2 gap-2 p-4 font-mono text-sm">
          {backupCodes.map((code) => (
            <span key={code}>{code}</span>
          ))}
        </div>
        <Button size="sm" onClick={() => setStep("idle")} className="self-start">
          Done
        </Button>
      </div>
    );
  }

  if (step === "confirm-password") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="2fa-password">Confirm your password</Label>
          <Input id="2fa-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleEnable} isLoading={isLoading}>
            Enable
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setStep("idle")}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        {isEnabled ? (
          <>
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            Two-factor authentication is enabled
          </>
        ) : (
          <>
            <ShieldOff className="size-4 text-muted-foreground" aria-hidden="true" />
            Two-factor authentication is off
          </>
        )}
      </div>
      {isEnabled ? (
        <Button size="sm" variant="destructive" onClick={() => setStep("confirm-password")}>
          Disable
        </Button>
      ) : (
        <Button size="sm" onClick={() => setStep("confirm-password")}>
          Enable
        </Button>
      )}
    </div>
  );
}