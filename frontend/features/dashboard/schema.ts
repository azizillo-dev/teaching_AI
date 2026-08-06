export interface DashboardOverview {
  total_groups: number;
  total_students: number;
  total_assignments: number;
  total_submissions: number;
}

export interface AIStatistics {
  average_score: number;
  highest_score: number;
  lowest_score: number;
  submissions_checked: number;
  submissions_pending: number;
  submissions_failed: number;
}

export interface GroupRanking {
  group_id: string;
  group_name: string;
  average_score: number;
  student_count: number;
}

export interface StudentRanking {
  student_id: string;
  full_name: string;
  average_score: number;
  completed_assignments: number;
}

export interface CommonMistake {
  mistake: string;
  count: number;
}

export interface RecentActivity {
  submission_id: string;
  assignment_id: string;
  student: string;
  group: string;
  assignment: string;
  score: number;
  status: "pending" | "submitted" | "checking" | "checked" | "failed";
  submitted_at: string;
}

export interface TeacherDashboardResponse {
  overview: DashboardOverview;
  ai_statistics: AIStatistics;
  group_ranking: GroupRanking[];
  student_ranking: StudentRanking[];
  common_mistakes: CommonMistake[];
  recent_activity: RecentActivity[];
}
