import { api } from "@/lib/api";
import { Assignment, AssignmentCreateFormData, AssignmentUpdateFormData, Submission } from "@/features/assignments/schema";

export const AssignmentsService = {
  // Teacher Endpoints
  getTeacherAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>("/assignments/teacher/assignments/");
    return response.data;
  },
  getTeacherAssignment: async (id: string): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/teacher/assignments/${id}/`);
    return response.data;
  },
  createAssignment: async (data: AssignmentCreateFormData | FormData): Promise<Assignment> => {
    let payload;
    let headers;
    if (data instanceof FormData) {
      payload = data;
      headers = { "Content-Type": "multipart/form-data" };
    } else {
      payload = data;
      headers = { "Content-Type": "application/json" };
    }
    const response = await api.post<Assignment>("/assignments/teacher/assignments/", payload, { headers });
    return response.data;
  },
  updateAssignment: async ({ id, data }: { id: string; data: AssignmentUpdateFormData }): Promise<Assignment> => {
    const response = await api.patch<Assignment>(`/assignments/teacher/assignments/${id}/`, data);
    return response.data;
  },
  deleteAssignment: async (id: string): Promise<void> => {
    await api.delete(`/assignments/teacher/assignments/${id}/`);
  },
  getTeacherSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>("/assignments/teacher/submissions/");
    return response.data;
  },

  // Student Endpoints
  getStudentAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get<Assignment[]>("/assignments/student/assignments/");
    return response.data;
  },
  getStudentAssignment: async (id: string): Promise<Assignment> => {
    const response = await api.get<Assignment>(`/assignments/student/assignments/${id}/`);
    return response.data;
  },
  getStudentSubmissions: async (): Promise<Submission[]> => {
    const response = await api.get<Submission[]>("/assignments/student/submissions/");
    return response.data;
  },
  getStudentSubmission: async (id: string): Promise<Submission> => {
    const response = await api.get<Submission>(`/assignments/student/submissions/${id}/`);
    return response.data;
  },
  createSubmission: async (assignmentId: string): Promise<Submission> => {
    const response = await api.post<Submission>("/assignments/student/submissions/", { assignment: assignmentId });
    return response.data;
  },
  uploadSubmissionImages: async ({ submissionId, formData }: { submissionId: string; formData: FormData }): Promise<Submission> => {
    const response = await api.post<Submission>(`/assignments/student/submissions/${submissionId}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
};
