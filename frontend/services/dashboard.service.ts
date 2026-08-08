import { api } from "@/lib/api";

export interface StudentDashboardData {
  groups: {
    id: string;
    name: string;
    teacher_name: string;
  }[];
  assignments: {
    pending: { id: string; title: string; deadline: string; group_name: string }[];
    submitted: { id: string; title: string; deadline: string; group_name: string }[];
    completed: { id: string; title: string; deadline: string; group_name: string; score: number }[];
  };
  library: {
    id: string;
    title: string;
    subject: string;
    teacher_name: string;
  }[];
  leaderboard: {
    student_id: string;
    full_name: string;
    average_score: number;
    is_me: boolean;
  }[];
  my_rank: number;
  rank_change: number;
}

export interface TeacherAnalyticsData {
  groups: { id: string; name: string }[];
  selected_group_id: string | null;
  selected_group_name: string | null;
  top_students: {
    student_id: string;
    full_name: string;
    average_score: number;
    initials: string;
  }[];
  weekly_stats: {
    completed: number;
    not_completed: number;
    total: number;
  };
  monthly_stats: {
    completed: number;
    not_completed: number;
    total: number;
  };
}

export const DashboardService = {
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await api.get<StudentDashboardData>("/dashboard/student/");
    return response.data;
  },
  
  getTeacherAnalytics: async (groupId?: string): Promise<TeacherAnalyticsData> => {
    const params = new URLSearchParams();
    if (groupId) params.append("group_id", groupId);
    const response = await api.get<TeacherAnalyticsData>(`/dashboard/analytics/?${params.toString()}`);
    return response.data;
  }
};
