import { api } from "@/lib/api";
import { Book, BookUploadFormData } from "./schema";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getBooks = async (): Promise<Book[]> => {
  const { data } = await api.get<Book[] | PaginatedResponse<Book>>("/library/books/");
  // Handle pagination if API uses it
  if (Array.isArray(data)) return data;
  return data.results;
};

export const uploadBook = async (formData: FormData): Promise<Book> => {
  const { data } = await api.post<Book>("/library/books/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
