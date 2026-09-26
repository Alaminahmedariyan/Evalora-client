import { z } from "zod";

export const mcqOptionSchema = z.object({
  optionText: z.string().trim().min(1, "Option text is required.").max(500),
  isCorrect: z.boolean(),
  order: z.number().int().min(1),
});

export const testCaseSchema = z.object({
  input: z.string().max(5000).optional(),
  expectedOutput: z.string().trim().min(1, "Expected output is required.").max(5000),
  isSample: z.boolean().optional(),
  points: z.coerce.number().int().min(0).max(1000).optional(),
  timeLimitMs: z.coerce.number().int().positive().optional(),
  memoryLimitMb: z.coerce.number().int().positive().optional(),
});

const baseFields = {
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(10000),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  defaultMarks: z.coerce.number().int().min(1).max(1000).optional(),
  isPublic: z.boolean().optional(),
};

const mcqCreateSchema = z.object({
  ...baseFields,
  type: z.literal("MCQ"),
  mcqType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]).default("SINGLE_CHOICE"),
  explanation: z.string().trim().max(2000).optional(),
  options: z.array(mcqOptionSchema).min(2, "Provide at least 2 options.").max(10, "At most 10 options are allowed."),
});

const codingCreateSchema = z.object({
  ...baseFields,
  type: z.literal("CODING"),
  timeLimitSeconds: z.coerce.number().int().min(1).max(7200).optional(),
  testCases: z.array(testCaseSchema).min(1, "Provide at least 1 test case."),
});

const writtenCreateSchema = z.object({
  ...baseFields,
  type: z.literal("WRITTEN"),
});

export const createProblemSchema = z
  .discriminatedUnion("type", [mcqCreateSchema, codingCreateSchema, writtenCreateSchema])
  .superRefine((data, ctx) => {
    if (data.type !== "MCQ") return;

    const orders = data.options.map((o) => o.order);
    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({ code: "custom", message: "Option order values must be unique.", path: ["options"] });
    }

    const correctCount = data.options.filter((o) => o.isCorrect).length;
    if (correctCount === 0) {
      ctx.addIssue({ code: "custom", message: "At least one option must be marked correct.", path: ["options"] });
    }
    if (data.mcqType === "SINGLE_CHOICE" && correctCount > 1) {
      ctx.addIssue({
        code: "custom",
        message: "SINGLE_CHOICE questions must have exactly one correct option.",
        path: ["options"],
      });
    }
  });

export const baseProblemFields = z.object(baseFields);

// Mirrors the backend's updateProblemSchema. `type` is deliberately absent
// — it's immutable after creation (see problem.interface.ts's comment).
export const updateProblemFields = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(10).max(10000).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  defaultMarks: z.coerce.number().int().min(1).max(1000).optional(),
  isPublic: z.boolean().optional(),
  timeLimitSeconds: z.coerce.number().int().min(1).max(7200).optional(),
  mcqType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]).optional(),
  explanation: z.string().trim().max(2000).optional(),
  options: z.array(mcqOptionSchema).min(2).max(10).optional(),
  testCases: z.array(testCaseSchema).min(1).optional(),
});