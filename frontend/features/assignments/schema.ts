import { z } from "zod";

export const assignmentCreateSchema = z.object({
  group: z.string().min(1, "Group is required"),
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  deadline: z.string().min(1, "Deadline is required"),
});

export const assignmentUpdateSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional(),
  deadline: z.string().optional(),
  is_active: z.boolean().optional(),
});

export type AssignmentCreateFormData = z.infer<typeof assignmentCreateSchema>;
export type AssignmentUpdateFormData = z.infer<typeof assignmentUpdateSchema>;

export interface Assignment {
  id: string;
  group: string;
  group_name: string;
  title: string;
  description: string;
  deadline: string;
  is_active: boolean;
  submitted_count: number;
  total_students: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface SubmissionImage {
  id: string;
  image: string;
  created_at: string;
}

export interface Submission {
  id: string;
  assignment: string;
  assignment_title: string;
  group_name: string;
  student_id: string;
  student_email: string;
  student_first_name: string;
  student_last_name: string;
  status: "pending" | "submitted" | "checking" | "checked" | "failed";
  score: number;
  feedback: string;
  mistakes: Record<string, string>[];
  images: SubmissionImage[];
  created_at: string;
  updated_at: string;
}
