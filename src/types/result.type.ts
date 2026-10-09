export type ResultStatus = "PENDING" | "PASSED" | "FAILED";

export interface ResultCandidateSummary {
  id: string;
  attemptNumber: number;
  submittedAt: string | null;
  candidate: { id: string; name: string; email: string };
}

export interface ResultAssessmentSummary {
  id: string;
  title: string;
  passingMarks: number;
}

// Matches RESULT_LEADERBOARD_SELECT — used for both the single-result view
// and each leaderboard row.
export interface Result {
  id: string;
  totalScore: number;
  totalMarks: number;
  percentage: number;
  status: ResultStatus;
  rank: number | null;
  evaluatedAt: string | null;
  assessment?: ResultAssessmentSummary;
  attempt: ResultCandidateSummary;
}

export interface ComputeRanksResult {
  ranked: number;
}