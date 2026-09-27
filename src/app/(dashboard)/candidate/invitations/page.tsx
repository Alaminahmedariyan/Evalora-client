import { MyInvitationsList } from "@/components/module/invitation";

export default function CandidateInvitationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
        <p className="text-sm text-muted-foreground">Assessments you&apos;ve been invited to.</p>
      </div>
      <MyInvitationsList />
    </div>
  );
}