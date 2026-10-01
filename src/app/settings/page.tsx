import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AuthGuard from "@/components/module/auth/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/form";
import { TwoFactorSetup } from "@/components/module/auth/TwoFactorSetup";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <Link href="/" className="interactive flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight">Account settings</h1>

        <AuthGuard>
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <TwoFactorSetup />
            </CardContent>
          </Card>
        </AuthGuard>
      </div>
    </div>
  );
}
