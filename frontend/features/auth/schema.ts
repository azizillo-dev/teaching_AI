import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Iltimos, yaroqli elektron pochta manzilini kiriting." }),
  password: z.string().min(1, { message: "Parolni kiritish majburiy." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
