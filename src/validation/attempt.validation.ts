import { z } from "zod";

export const saveSubmissionSchema = z
  .object({
    selectedOptionIds: z.array(z.string().min(1)).min(1).max(10).optional(),
    code: z.string().max(20000).optional(),
    language: z.string().trim().max(50).optional(),
    answerText: z.string().trim().max(20000).optional(),
  })
  .refine(
    (data) => data.selectedOptionIds !== undefined || data.code !== undefined || data.answerText !== undefined,
    { message: "Provide an answer before saving." },
  );