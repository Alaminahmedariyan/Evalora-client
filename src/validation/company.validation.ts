import { z } from "zod";

// Mirrors the backend's registerCompanySchema exactly.
export const registerCompanyFields = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters.")
    .max(150, "Company name must be at most 150 characters."),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be at most 2000 characters.")
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Enter a valid website URL, e.g. https://example.com.")
    .optional()
    .or(z.literal("")),
  industry: z
    .string()
    .trim()
    .max(100, "Industry must be at most 100 characters.")
    .optional()
    .or(z.literal("")),
});

export const registerCompanySchema = registerCompanyFields;