import { z } from "zod";

export const assignmentCreateSchema = z.object({
  group: z.string().min(1, "Guruh tanlanishi shart"),
  title: z.string().min(1, "Sarlavha kiritilishi shart").max(255),
  description: z.string().optional().default(""),
  book: z.string().optional().nullable(),
  page_start: z.coerce.number().min(1, "Boshlanish 1 dan kichik bo'lmaydi").optional().nullable(),
  page_end: z.coerce.number().min(1, "Tugash 1 dan kichik bo'lmaydi").optional().nullable(),
  deadline: z.string().optional(),
  image: z.any().optional(),
}).refine(data => {
  const hasDesc = data.description && data.description.trim().length > 0;
  const hasBook = data.book && data.page_start && data.page_end;
  const hasImage = data.image && data.image.length > 0;
  return hasDesc || hasBook || hasImage;
}, {
  message: "Kamida tavsif yozing, rasm yuklang yoki kitob varaqlarini tanlang",
  path: ["description"] // Attach error to description field by default
});

export const assignmentUpdateSchema = z.object({
  title: z.string().max(255).optional(),
  description: z.string().optional().default(""),
  is_active: z.boolean().optional(),
  deadline: z.string().optional(),
});

export type AssignmentCreateFormData = z.infer<typeof assignmentCreateSchema>;
export type AssignmentUpdateFormData = z.infer<typeof assignmentUpdateSchema>;

export interface Assignment {
  id: string;
  group: string;
  group_name: string;
  title: string;
  description: string;
  book: string | null;
  page_start: number | null;
  page_end: number | null;
  image: string | null;
  extracted_content: string;
  extraction_status: "pending" | "done" | "failed";
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
