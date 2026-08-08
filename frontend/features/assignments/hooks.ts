import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignmentsService } from "@/services/assignments.service";

// Teacher Hooks
export const useTeacherAssignments = () => {
  return useQuery({
    queryKey: ["teacher-assignments"],
    queryFn: AssignmentsService.getTeacherAssignments,
  });
};

export const useTeacherAssignment = (id: string) => {
  return useQuery({
    queryKey: ["teacher-assignments", id],
    queryFn: () => AssignmentsService.getTeacherAssignment(id),
    enabled: !!id,
  });
};

export const useTeacherSubmissions = () => {
  return useQuery({
    queryKey: ["teacher-submissions"],
    queryFn: AssignmentsService.getTeacherSubmissions,
  });
};

export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentsService.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentsService.updateAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentsService.deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-assignments"] });
    },
  });
};

// Student Hooks
export const useStudentAssignments = () => {
  return useQuery({
    queryKey: ["student-assignments"],
    queryFn: AssignmentsService.getStudentAssignments,
  });
};

export const useStudentAssignment = (id: string) => {
  return useQuery({
    queryKey: ["student-assignments", id],
    queryFn: () => AssignmentsService.getStudentAssignment(id),
    enabled: !!id,
  });
};

export const useStudentSubmissions = (pollInterval?: number) => {
  return useQuery({
    queryKey: ["student-submissions"],
    queryFn: AssignmentsService.getStudentSubmissions,
    refetchInterval: pollInterval,
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentsService.createSubmission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-submissions"] });
    },
  });
};

export const useUploadImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AssignmentsService.uploadSubmissionImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-submissions"] });
    },
  });
};
