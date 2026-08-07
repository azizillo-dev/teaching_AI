import { z } from "zod";

export const groupCreateSchema = z.object({
  name: z.string().min(1, "Group name is required").max(255),
  description: z.string().optional(),
  join_password: z.string().min(4, "Parol kamida 4 xonali bo'lishi kerak"),
});

export const groupUpdateSchema = z.object({
  name: z.string().min(1, "Group name is required").max(255),
  description: z.string().optional(),
});

export type GroupCreateFormData = z.infer<typeof groupCreateSchema>;
export type GroupUpdateFormData = z.infer<typeof groupUpdateSchema>;

export interface Group {
  id: string;
  name: string;
  description: string;
  student_count: number;
  assignment_count: number;
  average_score: number;
  created_at: string;
  updated_at: string;
  join_code: string;
  join_password: string;
}
