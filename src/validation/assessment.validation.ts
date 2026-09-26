import { z } from "zod";

export const assessmentProblemSchema = z.object({
  problemId: z.string().min(1),
  order: z.number().int().min(1),
  marks: z.coerce.number().int().min(1, "Marks must be at least 1.").max(1000),
});

export const baseAssessmentFields = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(200),
  description: z.string().trim().max(5000).optional(),
  instructions: z.string().trim().max(5000).optional(),
  durationMinutes: z.coerce.number().int().min(5, "At least 5 minutes.").max(600, "At most 10 hours."),
  passingMarks: z.coerce.number().int().min(0),
  maxAttempts: z.coerce.number().int().min(1).max(10).optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  shuffleQuestions: z.boolean().optional(),
  showResultImmediately: z.boolean().optional(),
  allowReview: z.boolean().optional(),
});

export const createAssessmentSchema = baseAssessmentFields
  .extend({
    problems: z.array(assessmentProblemSchema).min(1, "Add at least one problem."),
  })
  .superRefine((data, ctx) => {
    const marksSum = data.problems.reduce((sum, p) => sum + p.marks, 0);
    if (data.passingMarks > marksSum) {
      ctx.addIssue({ code: "custom", message: "Passing marks cannot exceed total marks.", path: ["passingMarks"] });
    }
    if (data.startAt && data.endAt && new Date(data.endAt) <= new Date(data.startAt)) {
      ctx.addIssue({ code: "custom", message: "End time must be after start time.", path: ["endAt"] });
    }
    const problemIds = data.problems.map((p) => p.problemId);
    if (new Set(problemIds).size !== problemIds.length) {
      ctx.addIssue({ code: "custom", message: "The same problem cannot be added twice.", path: ["problems"] });
    }
  });