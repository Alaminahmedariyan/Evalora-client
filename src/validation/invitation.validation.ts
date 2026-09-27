import { z } from "zod";

export const inviteCandidatesSchema = z.object({
  emails: z
    .array(z.string().trim().email("Invalid email address."))
    .min(1, "Provide at least one email address.")
    .max(100, "At most 100 emails per request."),
  expiresInDays: z.coerce.number().int().min(1).max(90).optional(),
});