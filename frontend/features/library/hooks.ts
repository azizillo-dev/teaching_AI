import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBooks, uploadBook, deleteBook } from "./api";
import { Book } from "./schema";

export const useBooks = () => {
  return useQuery<Book[], Error>({
    queryKey: ["books"],
    queryFn: getBooks,
  });
};

export const useUploadBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      alert("Kitob muvaffaqiyatli yuklandi!");
    },
    onError: (error: any) => {
      alert(error?.response?.data?.detail || "Kitob yuklashda xatolik yuz berdi");
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
};
