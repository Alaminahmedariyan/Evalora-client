export interface CandidateUserSummary {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

// Matches CANDIDATE_DETAIL_SELECT exactly.
export interface CandidateProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  isVisibleToRecruiters?: boolean;
  skills: string[] | null;
  experienceYears: number | null;
  createdAt: string;
  updatedAt: string;
  user: CandidateUserSummary;
}

export interface UpsertCandidateProfilePayload {
  headline?: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  skills?: string[];
  experienceYears?: number | null;
  isVisibleToRecruiters?: boolean;
  resume?: File;
}

export interface CandidateListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "experienceYears";
  sortOrder?: "asc" | "desc";
}
