export interface SubmissionTestCase {
  id: string;
  input: string | null;
  expectedOutput: string;
  isSample: boolean;
  points: number;
}

export interface SubmissionAnswerOption {
  optionId: string;
  option: { id: string; optionText: string; isCorrect: boolean };
}

export interface SubmissionTestCaseResult {
  id: string;
  testCaseId: string;
  passed: boolean;
  actualOutput: string | null;
  points: number;
}

export interface SubmissionEvaluationSummary {
  id: string;
  score: number;
  maxScore: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  isAutoEvaluated: boolean;
  feedback: string | null;
  evaluatedAt: string | null;
  evaluatorId: string | null;
}

// Matches SUBMISSION_GRADING_SELECT exactly — the recruiter/admin grading view.
export interface GradingSubmission {
  id: string;
  attemptId: string;
  problemId: string;
  answerText: string | null;
  code: string | null;
  language: string | null;
  status: string;
  submittedAt: string | null;
  problem: {
    id: string;
    title: string;
    type: "MCQ" | "CODING" | "WRITTEN";
    defaultMarks: number;
    testCases: SubmissionTestCase[];
  };
  answers: SubmissionAnswerOption[];
  testCaseResults: SubmissionTestCaseResult[];
  evaluation: SubmissionEvaluationSummary | null;
}

export interface TestCaseResultInput {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  points?: number;
}

export interface ManualEvaluationPayload {
  score: number;
  feedback?: string;
  testCaseResults?: TestCaseResultInput[];
}