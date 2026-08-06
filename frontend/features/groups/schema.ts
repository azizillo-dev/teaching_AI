import { z } from "zod";

export const groupSchema = z.object({
  name: z.string().min(1, "Group name is required").max(255),
  description: z.string().optional(),
});

export type GroupFormData = z.infer<typeof groupSchema>;

export interface Group {
  id: string;
  name: string;
  description: string;
  student_count: number;
  assignment_count: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}
