import { z } from "zod";

const isHttpUrl = (value: string) => {
  if (value === "") return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const urlField = (label: string) =>
  z
    .string()
    .trim()
    .max(2048, `${label} URL is too long.`)
    .refine(isHttpUrl, `Enter a valid ${label} URL starting with https://, e.g. https://example.com/you.`);

// Mirrors the backend's candidate.validation.ts. Every field is a string
// here (that is what inputs hold); an empty string means "leave it blank".
export const candidateProfileFields = z.object({
  headline: z
    .string()
    .trim()
    .max(150, "Headline must be at most 150 characters.")
    .refine((v) => v === "" || v.length >= 2, "Headline must be at least 2 characters."),
  bio: z.string().trim().max(2000, "Bio must be at most 2000 characters."),
  phone: z.string().trim().max(30, "Phone number is too long."),
  location: z.string().trim().max(150, "Location must be at most 150 characters."),
  linkedinUrl: urlField("LinkedIn"),
  githubUrl: urlField("GitHub"),
  portfolioUrl: urlField("portfolio"),
  experienceYears: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 60),
      "Enter a whole number of years between 0 and 60.",
    ),
});