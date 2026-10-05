import apiClient from "@/lib/apiClient";
import type { ApiResponse, CandidateListParams, CandidateProfile, UpsertCandidateProfilePayload } from "@/types";

export function getMyProfile() {
  return apiClient<ApiResponse<CandidateProfile>>("/candidates/me");
}

export function upsertMyProfile(payload: UpsertCandidateProfilePayload) {
  const formData = new FormData();

  // An empty string clears the field on the server; undefined leaves it alone.
  const appendText = (key: string, value: string | undefined) => {
    if (value !== undefined) formData.append(key, value);
  };

  appendText("headline", payload.headline);
  appendText("bio", payload.bio);
  appendText("phone", payload.phone);
  appendText("location", payload.location);
  appendText("linkedinUrl", payload.linkedinUrl);
  appendText("githubUrl", payload.githubUrl);
  appendText("portfolioUrl", payload.portfolioUrl);

  if (payload.experienceYears !== undefined) {
    formData.append("experienceYears", payload.experienceYears === null ? "" : String(payload.experienceYears));
  }

  // Always a JSON array, so an empty list ("[]") really clears the skills.
  if (payload.skills !== undefined) {
    formData.append("skills", JSON.stringify(payload.skills));
  }

  if (payload.isVisibleToRecruiters !== undefined) {
    formData.append("isVisibleToRecruiters", String(payload.isVisibleToRecruiters));
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
