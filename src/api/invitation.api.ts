import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Invitation,
  InvitationListParams,
  InviteCandidatesPayload,
  InviteCandidatesResult,
} from "@/types";

export function inviteCandidates(assessmentId: string, payload: InviteCandidatesPayload) {
  return apiClient<ApiResponse<InviteCandidatesResult>>(`/invitations/assessments/${assessmentId}`, {
    method: "POST",
    body: payload,
    // Required by the backend's idempotency() middleware on this route —
    // a fresh key per call means "retry this exact request safely," not
    // "dedupe across different invite batches."
    headers: { "Idempotency-Key": crypto.randomUUID() },
  });
}

export function getInvitationsForAssessment(assessmentId: string, params: InvitationListParams) {
  return apiClient<ApiResponse<Invitation[]>>(`/invitations/assessments/${assessmentId}`, { params });
}

export function getMyInvitations() {
  return apiClient<ApiResponse<Invitation[]>>("/invitations/me");
}

export function acceptInvitation(id: string) {
  return apiClient<ApiResponse<Invitation>>(`/invitations/${id}/accept`, { method: "POST" });
}

export function declineInvitation(id: string) {
  return apiClient<ApiResponse<Invitation>>(`/invitations/${id}/decline`, { method: "POST" });
}

export function cancelInvitation(id: string) {
  return apiClient<ApiResponse<null>>(`/invitations/${id}`, { method: "DELETE" });
}