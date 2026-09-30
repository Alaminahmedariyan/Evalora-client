import { z } from "zod";

export const consentTypeSchema = z.enum(["MARKETING", "ANALYTICS", "THIRD_PARTY", "PRIVACY_POLICY", "TERMS_OF_SERVICE"]);

export const updateConsentSchema = z.object({
  consentType: consentTypeSchema,
  granted: z.boolean(),
});