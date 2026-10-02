import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  Invitation,
  InvitationListParams,
  InviteCandidatesPayload,
  InviteCandidatesResult,
} from "@/types";

export function inviteCandidates(assessmentId: string, payload: InviteCandidatesPayload, idempotencyKey: string) {
  return apiClient<ApiResponse<InviteCandidatesResult>>(`/invitations/assessments/${assessmentId}`, {
    method: "POST",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
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