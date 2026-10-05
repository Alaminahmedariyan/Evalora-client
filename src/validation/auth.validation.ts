import { z } from "zod";

// Mirrors passwordSchema in the backend's auth.validation.ts.
// Keep the frontend and backend password rules in sync.
// Login intentionally does not use this schema because sign-in only
// requires that a password was provided.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(
    /[a-z]/,
    "Password must contain at least 1 lowercase letter.",
  )
  .regex(
    /[A-Z]/,
    "Password must contain at least 1 uppercase letter.",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least 1 number.",
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least 1 special character.",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: z.string().min(1, "Password is required"),

  rememberMe: z.boolean().optional(),
});

// Kept separate from the .refine()-wrapped version below so individual
// field validators can still reach `.shape.<field>` directly.
// A ZodEffects / refined schema does not expose `.shape` directly.
export const registerFields = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters."),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email"),

  password: passwordSchema,

  confirmPassword: z
    .string()
    .min(1, "Confirm your password"),

  acceptTerms: z
    .boolean()
    .refine(
      (value) => value === true,
      "You must accept the Terms of Service and Privacy Policy.",
    ),
});

export const registerSchema = registerFields.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  },
);

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits.");

export const resetPasswordFields = z.object({
  otp: otpSchema,

  newPassword: passwordSchema,

  confirmPassword: z
    .string()
    .min(1, "Confirm your password"),
});

export const resetPasswordSchema = resetPasswordFields.refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  },
);

export const changePasswordFields = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required."),

    newPassword: passwordSchema,

    confirmNewPassword: z
      .string()
      .min(1, "Confirm your new password."),
  })
  .refine(
    (data) => data.newPassword === data.confirmNewPassword,
    {
      message: "Passwords don't match",
      path: ["confirmNewPassword"],
    },
  );