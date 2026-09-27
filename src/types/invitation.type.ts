export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "COMPLETED";

// Nested assessment summary — matches INVITATION_SELECT's `assessment` shape.
export interface InvitationAssessmentSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  companyId: string;
}

// Matches INVITATION_SELECT exactly.
export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string | null;
  email: string;
  status: InvitationStatus;
  invitedAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
  completedAt: string | null;
  assessment: InvitationAssessmentSummary;
}

export interface InviteCandidatesPayload {
  emails: string[];
  expiresInDays?: number;
}

export interface InviteCandidatesResult {
  invited: number;
  skipped: number;
  invitations: Invitation[];
}

export interface InvitationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvitationStatus;
}