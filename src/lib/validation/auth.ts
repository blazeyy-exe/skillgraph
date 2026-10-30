import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Passwords must be 72 characters or fewer.");

export const signUpSchema = z.object({
  preferredName: z.string().trim().min(1, "Tell us what to call you.").max(80),
  email: z.string().trim().email("Enter a valid email address."),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
