import { z } from "zod";

export const createCheckoutSchema = z.object({
  plan: z.enum(["PRO", "ENTERPRISE"], { message: "Plan must be PRO or ENTERPRISE." }),
});