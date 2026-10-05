import { z } from "zod";

export const CONTACT_MESSAGE_MAX = 5000;

const singleLine = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be at most ${max} characters.`)
    .regex(/^[^\r\n]*$/, `${label} must be a single line.`);

export const contactFormSchema = z.object({
  name: singleLine("Name", 2, 100),
  email: z.string().trim().email("Enter a valid email address.").max(320, "Email is too long."),
  subject: singleLine("Subject", 3, 150),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(CONTACT_MESSAGE_MAX, `Message must be at most ${CONTACT_MESSAGE_MAX} characters.`),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;