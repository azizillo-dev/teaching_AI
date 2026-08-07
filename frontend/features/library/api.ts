import axios from "@/lib/axios";
import { Book, BookUploadFormData } from "./schema";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getBooks = async (): Promise<Book[]> => {
  const { data } = await axios.get<Book[] | PaginatedResponse<Book>>("/api/v1/library/books/");
  // Handle pagination if API uses it
  if (Array.isArray(data)) return data;
  return data.results;
};

export const uploadBook = async (formData: FormData): Promise<Book> => {
  const { data } = await axios.post<Book>("/api/v1/library/books/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
