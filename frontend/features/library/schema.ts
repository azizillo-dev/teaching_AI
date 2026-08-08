import { z } from "zod";

export interface Book {
  id: string;
  title: string;
  subject: string;
  file: string;
  total_pages: number | null;
  status: "processing" | "ready" | "failed";
  created_at: string;
}

export const bookUploadSchema = z.object({
  title: z.string().min(1, "Sarlavha kiritilishi shart"),
  subject: z.string().optional(),
  file: z.any().refine((val) => {
    if (!val) return false;
    if (val instanceof File) return true;
    if (val instanceof FileList && val.length > 0) return true;
    return false;
  }, "Fayl yuklanishi shart"),
});

export type BookUploadFormData = z.infer<typeof bookUploadSchema>;
