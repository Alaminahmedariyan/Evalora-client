import { z } from "zod";

const urlField = (label: string) =>
  z.string().trim().url(`Enter a valid ${label} URL, e.g. https://example.com/you.`).optional().or(z.literal(""));

export const upsertProfileFields = z.object({
  headline: z.string().trim().min(2, "At least 2 characters.").max(150).optional().or(z.literal("")),
  bio: z.string().trim().max(2000, "At most 2000 characters.").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number.")
    .optional()
    .or(z.literal("")),
  location: z.string().trim().max(150).optional().or(z.literal("")),
  linkedinUrl: urlField("LinkedIn"),
  githubUrl: urlField("GitHub"),
  portfolioUrl: urlField("portfolio"),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});