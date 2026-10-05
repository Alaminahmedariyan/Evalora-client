"use client";

import { Download } from "lucide-react";

import { useExportMyData } from "@/hooks";
import { isApiError } from "@/lib/apiClient";
import { notify } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DataExportCard() {
  const exportMutation = useExportMyData();

  async function handleDownload() {
    try {
      const res = await exportMutation.mutateAsync();

      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `evalora-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      notify.success("Your data has been downloaded");
    } catch (error) {
      notify.error("Couldn't prepare your data", isApiError(error) ? error.message : undefined);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Download your data</CardTitle>
        <CardDescription>
          Get a copy of your account, profile, consents, invitations, assessment attempts, proctoring
          activity, notifications and payments as a JSON file. Scores and feedback appear once the
          company releases results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => void handleDownload()} isLoading={exportMutation.isPending}>
          <Download className="size-4" aria-hidden="true" />
          Download my data
        </Button>
      </CardContent>
    </Card>
  );
}