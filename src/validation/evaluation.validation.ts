import { z } from "zod";

export const testCaseResultInputSchema = z.object({
  testCaseId: z.string().min(1),
  passed: z.boolean(),
  actualOutput: z.string().max(5000).optional(),
  points: z.coerce.number().int().min(0).max(1000).optional(),
});

export const manualEvaluationFields = z.object({
  score: z.coerce.number().min(0, "Score cannot be negative."),
  feedback: z.string().trim().max(2000).optional(),
  testCaseResults: z.array(testCaseResultInputSchema).max(50).optional(),
});