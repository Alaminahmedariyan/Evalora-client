"use client";

import { useMyCandidateProfile } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateProfileForm } from "@/components/form";
import { ConsentToggleList } from "@/components/module/consent";

export default function CandidateProfilePage() {
  const { data, isPending } = useMyCandidateProfile();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">This is what recruiters see when they review your application.</p>
      </div>

      {isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <CandidateProfileForm profile={data?.data ?? null} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Privacy preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <ConsentToggleList />
        </CardContent>
      </Card>
    </div>
  );
}