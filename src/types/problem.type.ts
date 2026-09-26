export type ProblemType = "MCQ" | "CODING" | "WRITTEN";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type McqType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE";

export interface McqOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface TestCase {
  id: string;
  input: string | null;
  expectedOutput: string;
  isSample: boolean;
  points: number;
  timeLimitMs: number | null;
  memoryLimitMb: number | null;
}

// Matches PROBLEM_LIST_SELECT — lean shape for browse/search.
export interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  type: ProblemType;
  difficulty: Difficulty;
  defaultMarks: number;
  isPublic: boolean;
  createdAt: string;
}

// Matches PROBLEM_DETAIL_SELECT — full shape with nested MCQ/test case data.
export interface ProblemDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  defaultMarks: number;
  timeLimitSeconds: number | null;
  isPublic: boolean;
  companyId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  mcqProblem: { id: string; type: McqType; explanation: string | null; options: McqOption[] } | null;
  testCases: TestCase[];
}

export interface McqOptionInput {
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface TestCaseInput {
  input?: string;
  expectedOutput: string;
  isSample?: boolean;
  points?: number;
  timeLimitMs?: number;
  memoryLimitMb?: number;
}

type BaseProblemFields = {
  title: string;
  description: string;
  difficulty?: Difficulty;
  defaultMarks?: number;
  isPublic?: boolean;
};

export type CreateProblemPayload =
  | (BaseProblemFields & { type: "MCQ"; mcqType?: McqType; explanation?: string; options: McqOptionInput[] })
  | (BaseProblemFields & { type: "CODING"; timeLimitSeconds?: number; testCases: TestCaseInput[] })
  | (BaseProblemFields & { type: "WRITTEN" });

export interface ProblemListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProblemType;
  difficulty?: Difficulty;
  sortBy?: "createdAt" | "title" | "defaultMarks";
  sortOrder?: "asc" | "desc";
}

export type UpdateProblemPayload = Partial<{
  title: string;
  description: string;
  difficulty: Difficulty;
  defaultMarks: number;
  isPublic: boolean;
  timeLimitSeconds: number;
  mcqType: McqType;
  explanation: string;
  options: McqOptionInput[];
  testCases: TestCaseInput[];
}>;