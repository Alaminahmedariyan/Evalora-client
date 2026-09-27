import apiClient from "@/lib/apiClient";
import type { ApiResponse, GradingSubmission, ManualEvaluationPayload } from "@/types";

export function getSubmissionsForAttempt(attemptId: string) {
  return apiClient<ApiResponse<GradingSubmission[]>>(`/evaluations/attempts/${attemptId}/submissions`);
}

export function getSubmissionById(id: string) {
  return apiClient<ApiResponse<GradingSubmission>>(`/evaluations/submissions/${id}`);
}

export function getPendingEvaluations(assessmentId: string) {
  return apiClient<ApiResponse<GradingSubmission[]>>(`/evaluations/assessments/${assessmentId}/pending`);
}

export function evaluateSubmission(id: string, payload: ManualEvaluationPayload) {
  return apiClient<ApiResponse<GradingSubmission>>(`/evaluations/submissions/${id}`, {
    method: "PATCH",
    body: payload,
  });
}