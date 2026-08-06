import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentsService } from "@/services/students.service";

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: StudentsService.getStudents,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentsService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentsService.updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};
