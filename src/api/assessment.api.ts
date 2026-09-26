import apiClient from "@/lib/apiClient";
import type {
  ApiResponse,
  AssessmentDetail,
  AssessmentListItem,
  AssessmentListParams,
  AssessmentVersion,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
} from "@/types";

export function createAssessment(payload: CreateAssessmentPayload) {
  return apiClient<ApiResponse<AssessmentDetail>>("/assessments", { method: "POST", body: payload });
}

export function getAllAssessments(params: AssessmentListParams) {
  return apiClient<ApiResponse<AssessmentListItem[]>>("/assessments", { params });
}

export function getAssessmentById(id: string) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/assessments/${id}`);
}

export function updateAssessment(id: string, payload: UpdateAssessmentPayload) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/assessments/${id}`, { method: "PATCH", body: payload });
}

export function publishAssessment(id: string) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/assessments/${id}/publish`, { method: "PATCH" });
}

export function closeAssessment(id: string) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/assessments/${id}/close`, { method: "PATCH" });
}

export function deleteAssessment(id: string) {
  return apiClient<ApiResponse<null>>(`/assessments/${id}`, { method: "DELETE" });
}

export function createAssessmentVersion(id: string) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/assessments/${id}/versions`, { method: "POST" });
}

export function getAssessmentVersions(id: string) {
  return apiClient<ApiResponse<AssessmentVersion[]>>(`/assessments/${id}/versions`);
}

export function restoreAssessmentVersion(versionId: string) {
  return apiClient<ApiResponse<AssessmentDetail>>(`/versions/${versionId}/restore`, { method: "PATCH" });
}