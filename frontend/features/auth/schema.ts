import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Iltimos, yaroqli elektron pochta manzilini kiriting." }),
  password: z.string().min(1, { message: "Parolni kiritish majburiy." }),
});

export const registerSchema = z.object({
  first_name: z.string().min(2, { message: "Ism kamida 2 ta harfdan iborat bo'lishi kerak." }),
  last_name: z.string().min(2, { message: "Familiya kamida 2 ta harfdan iborat bo'lishi kerak." }),
  email: z.string().email({ message: "Yaroqli elektron pochta manzilini kiriting." }),
  password: z.string().min(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." }),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "Kod 6 xonali bo'lishi kerak." }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Yaroqli elektron pochta manzilini kiriting." }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "Kod 6 xonali bo'lishi kerak." }),
  new_password: z.string().min(6, { message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
