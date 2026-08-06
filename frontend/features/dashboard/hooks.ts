import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "./service";
import { TeacherDashboardResponse } from "./schema";

export const useTeacherDashboard = () => {
  return useQuery<TeacherDashboardResponse, Error>({
    queryKey: ["teacherDashboard"],
    queryFn: DashboardService.getTeacherDashboard,
  });
};
