import { api } from "@/lib/api";
import { Student, StudentCreateFormData, StudentCreateResponse, StudentUpdateFormData } from "@/features/students/schema";

export const StudentsService = {
  getStudents: async (): Promise<Student[]> => {
    const response = await api.get<Student[]>("/classrooms/students/");
    return response.data;
  },
  createStudent: async (data: StudentCreateFormData): Promise<StudentCreateResponse> => {
    const response = await api.post<StudentCreateResponse>("/classrooms/students/", data);
    return response.data;
  },
  updateStudent: async ({ id, data }: { id: string; data: StudentUpdateFormData }): Promise<Student> => {
    const response = await api.patch<Student>(`/classrooms/students/${id}/`, data);
    return response.data;
  },
};
