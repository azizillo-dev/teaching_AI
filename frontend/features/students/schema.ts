import { z } from "zod";

export const studentCreateSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(150),
  last_name: z.string().min(1, "Last name is required").max(150),
  group_id: z.string().optional(),
});

export const studentUpdateSchema = z.object({
  first_name: z.string().min(1).max(150).optional(),
  last_name: z.string().min(1).max(150).optional(),
  is_active: z.boolean().optional(),
});

export type StudentCreateFormData = z.infer<typeof studentCreateSchema>;
export type StudentUpdateFormData = z.infer<typeof studentUpdateSchema>;

export interface Student {
  id: string; // User ID
  profile_id: string; // Profile ID
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  created_at: string;
  group_name?: string | null;
  average_score?: number;
}

export interface StudentCreateResponse {
  id: string;
  profile_id: string;
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
}
