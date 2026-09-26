import type { Difficulty, ProblemType } from "./problem.type";

export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface AssessmentProblemInput {
  problemId: string;
  order: number;
  marks: number;
}

// Nested problem summary inside an assessment's problem list.
export interface AssessmentProblemSummary {
  id: string;
  order: number;
  marks: number;
  problem: {
    id: string;
    title: string;
    type: ProblemType;
    difficulty: Difficulty;
    defaultMarks: number;
  };
}

// Matches ASSESSMENT_LIST_SELECT.
export interface AssessmentListItem {
  id: string;
  title: string;
  slug: string;
  status: AssessmentStatus;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  startAt: string | null;
  endAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

// Matches ASSESSMENT_DETAIL_SELECT.
export interface AssessmentDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts: number;
  status: AssessmentStatus;
  startAt: string | null;
  endAt: string | null;
  publishedAt: string | null;
  shuffleQuestions: boolean;
  showResultImmediately: boolean;
  allowReview: boolean;
  version: number;
  isLatestVersion: boolean;
  companyId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  assessmentProblems: AssessmentProblemSummary[];
}

export interface AssessmentVersion {
  id: string;
  title: string;
  slug: string;
  status: AssessmentStatus;
  version: number;
  isLatestVersion: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentPayload {
  title: string;
  description?: string;
  instructions?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  maxAttempts?: number;
  startAt?: string;
  endAt?: string;
  shuffleQuestions?: boolean;
  showResultImmediately?: boolean;
  allowReview?: boolean;
  problems: AssessmentProblemInput[];
}

export type UpdateAssessmentPayload = Partial<Omit<CreateAssessmentPayload, "problems">> & {
  problems?: AssessmentProblemInput[];
};

export interface AssessmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: AssessmentStatus;
  sortBy?: "createdAt" | "title" | "startAt";
  sortOrder?: "asc" | "desc";
}