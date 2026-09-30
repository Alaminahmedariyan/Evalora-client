import apiClient from "@/lib/apiClient";
import type { ApiResponse, CandidateListParams, CandidateProfile, UpsertCandidateProfilePayload } from "@/types";

export function getMyProfile() {
  return apiClient<ApiResponse<CandidateProfile>>("/candidates/me");
}

export function upsertMyProfile(payload: UpsertCandidateProfilePayload) {
  const formData = new FormData();

  if (payload.headline !== undefined) formData.append("headline", payload.headline);
  if (payload.bio !== undefined) formData.append("bio", payload.bio);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);
  if (payload.location !== undefined) formData.append("location", payload.location);
  if (payload.linkedinUrl !== undefined) formData.append("linkedinUrl", payload.linkedinUrl);
  if (payload.githubUrl !== undefined) formData.append("githubUrl", payload.githubUrl);
  if (payload.portfolioUrl !== undefined) formData.append("portfolioUrl", payload.portfolioUrl);
  if (payload.experienceYears !== undefined) formData.append("experienceYears", String(payload.experienceYears));
  // Repeated same-name fields — the standard way an array survives a
  // multipart form. NOT verified against validateRequestWithFile's actual
  // parsing behavior (that middleware wasn't in the files reviewed) — test
  // this specifically after wiring it up; if skills don't save correctly,
  // the likely fix is JSON.stringify-ing the array into a single field instead.
  if (payload.skills) {
    for (const skill of payload.skills) formData.append("skills", skill);
  }
  if (payload.resume) formData.append("resume", payload.resume);

  return apiClient<ApiResponse<CandidateProfile>>("/candidates/me", {
    method: "PATCH",
    body: formData,
  });
}

export function getAllCandidates(params: CandidateListParams) {
  return apiClient<ApiResponse<CandidateProfile[]>>("/candidates", { params });
}

export function getCandidateProfileById(id: string) {
  return apiClient<ApiResponse<CandidateProfile>>(`/candidates/${id}`);
}