import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AttemptDetail,
  AttemptSubmission,
  ProctoringEvent,
  ProctoringEventPayload,
  SaveSubmissionPayload,
} from "@/types";

export function startAttempt(assessmentId: string, idempotencyKey: string) {
  return apiClient<ApiResponse<AttemptDetail>>("/attempts/start", {
    method: "POST",
    body: { assessmentId },
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function getMyAttempts() {
  return apiClient<ApiResponse<AttemptDetail[]>>("/attempts/me");
}

export function getAttemptById(id: string) {
  return apiClient<ApiResponse<AttemptDetail>>(`/attempts/${id}`);
}

export function saveSubmission(attemptId: string, problemId: string, payload: SaveSubmissionPayload, idempotencyKey: string) {
  return apiClient<ApiResponse<AttemptSubmission>>(`/attempts/${attemptId}/submissions/${problemId}`, {
    method: "PUT",
    body: payload,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function submitAttempt(attemptId: string, idempotencyKey: string) {
  return apiClient<ApiResponse<AttemptDetail>>(`/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function recordProctoringEvent(attemptId: string, payload: ProctoringEventPayload) {
  return apiClient<ApiResponse<{ recorded: boolean }>>(`/attempts/${attemptId}/proctoring-events`, {
    method: "POST",
    body: payload,
  });
}

export function getProctoringEvents(attemptId: string) {
  return apiClient<ApiResponse<ProctoringEvent[]>>(`/attempts/${attemptId}/proctoring-events`);
}