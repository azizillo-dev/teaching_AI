import { z } from "zod";

export interface Book {
  id: string;
  title: string;
  subject: string;
  pdf_file: string;
  total_pages: number | null;
  status: "processing" | "ready" | "failed";
  created_at: string;
}

export const bookUploadSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  subject: z.string().optional(),
  pdf_file: z.any().refine((file) => file instanceof File, "Fayl yuklanishi shart"),
});

export type BookUploadFormData = z.infer<typeof bookUploadSchema>;
