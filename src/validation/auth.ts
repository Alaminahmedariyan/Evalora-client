import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// Kept separate from the .refine()-wrapped version below so individual
// field validators can still reach `.shape.<field>` directly — a ZodEffects
// (what .refine() returns) doesn't expose .shape.
export const registerFields = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm your password"),
});

export const registerSchema = registerFields.refine(
  (data) => data.password === data.confirmPassword,
  { message: "Passwords don't match", path: ["confirmPassword"] },
);