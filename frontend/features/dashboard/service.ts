import { api } from "@/lib/api";
import { TeacherDashboardResponse } from "./schema";

export const DashboardService = {
  getTeacherDashboard: async (): Promise<TeacherDashboardResponse> => {
    const response = await api.get("/dashboard/teacher/");
    return response.data;
  },
};
