import type { AssessmentStatus } from "./assessment.type";
import type { Difficulty, McqType, ProblemType } from "./problem.type";

export type AttemptStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "EVALUATED" | "EXPIRED";
export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "EVALUATING" | "EVALUATED" | "FAILED";
export type ProctoringEventType =
  | "TAB_SWITCH"
  | "FULLSCREEN_EXIT"
  | "COPY"
  | "PASTE"
  | "DEVTOOLS_DETECTED"
  | "CAMERA_BLOCKED"
  | "MICROPHONE_BLOCKED"
  | "WINDOW_BLUR"
  | "WINDOW_FOCUS"
  | "OTHER";

// Candidate-facing MCQ option — deliberately has no `isCorrect` field
// (see the backend's ATTEMPT_PROBLEM_SELECT comment).
export interface AttemptMcqOption {
  id: string;
  optionText: string;
  order: number;
}

export interface AttemptSampleTestCase {
  id: string;
  input: string | null;
  expectedOutput: string;
  isSample: boolean;
}

// Matches ATTEMPT_PROBLEM_SELECT — the candidate's view of a problem while
// taking an attempt. No isCorrect, no explanation, no hidden test cases.
export interface AttemptProblem {
  id: string;
  title: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  defaultMarks: number;
  timeLimitSeconds: number | null;
  mcqProblem: { id: string; type: McqType; options: AttemptMcqOption[] } | null;
  testCases: AttemptSampleTestCase[];
}

export interface AttemptAssessmentProblem {
  id: string;
  order: number;
  marks: number;
  problem: AttemptProblem;
}

export interface AttemptSubmission {
  id: string;
  problemId: string;
  answerText: string | null;
  code: string | null;
  language: string | null;
  status: SubmissionStatus;
  submittedAt: string | null;
  answers: { optionId: string }[];
}

// Matches ATTEMPT_DETAIL_SELECT.
export interface AttemptDetail {
  id: string;
  assessmentId: string;
  candidateId: string;
  candidate?: { id: string; name: string; email: string };
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string | null;
  submittedAt: string | null;
  expiresAt: string;
  autoSubmittedAt: string | null;
  tabSwitchCount: number;
  createdAt: string;
  assessment: {
    id: string;
    title: string;
    description?: string | null;
    instructions?: string | null;
    companyId: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    shuffleQuestions: boolean;
    allowReview: boolean;
    showResultImmediately: boolean;
    assessmentProblems: AttemptAssessmentProblem[];
  };
  submissions: AttemptSubmission[];
}

export interface SaveSubmissionPayload {
  selectedOptionIds?: string[];
  code?: string;
  language?: string;
  answerText?: string;
}

export interface ProctoringEventPayload {
  eventType: ProctoringEventType;
  metadata?: Record<string, unknown>;
}

export interface ProctoringEvent {
  id: string;
  attemptId: string;
  eventType: ProctoringEventType;
  timestamp: string;
  metadata: Record<string, unknown> | null;
}
