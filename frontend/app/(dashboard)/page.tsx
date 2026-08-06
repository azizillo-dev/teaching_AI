"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useTeacherDashboard } from "@/features/dashboard/hooks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/ErrorState";
import { 
  ArrowRight, 
  BrainCircuit, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  FileWarning, 
  Flame, 
  Lightbulb, 
  Plus, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Users 
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useTeacherDashboard();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 md:ml-64 pt-8 animate-pulse">
        <div className="h-10 w-64 bg-muted rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
        <ErrorState message="Failed to load dashboard data." />
      </div>
    );
  }

  const { ai_statistics, group_ranking, student_ranking, common_mistakes, recent_activity } = data;

  // AI Recommendation logic
  let aiRecommendation = "Your students are performing consistently. Keep up the good work!";
  if (common_mistakes && common_mistakes.length > 0) {
    aiRecommendation = `Many students struggle with ${common_mistakes[0].mistake}. Consider reviewing this topic in your next class.`;
  }

  const weakestGroup = group_ranking && group_ranking.length > 0 ? group_ranking[group_ranking.length - 1] : null;
  const bestGroup = group_ranking && group_ranking.length > 0 ? group_ranking[0] : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 md:ml-64 pt-8 space-y-8">
      
      {/* 1. Header & Primary CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good morning, {user?.first_name || "Teacher"}</h1>
          <p className="text-muted-foreground mt-1">Here is what needs your attention today.</p>
        </div>
        <Link href="/assignments">
          <Button className="rounded-full shadow-sm font-medium gap-2">
            <Plus className="w-4 h-4" /> Create Assignment
          </Button>
        </Link>
      </div>

      {/* 2. Today's Overview (Quick Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
          <div className="flex items-center text-muted-foreground gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">Pending Output</span>
          </div>
          <div className="text-3xl font-semibold">{ai_statistics.submissions_pending}</div>
        </Card>
        
        <Card className="p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
          <div className="flex items-center text-muted-foreground gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Waiting for AI</span>
          </div>
          <div className="text-3xl font-semibold">{ai_statistics.submissions_pending}</div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
          <div className="flex items-center text-muted-foreground gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Checked Today</span>
          </div>
          <div className="text-3xl font-semibold">{ai_statistics.submissions_checked}</div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 hover:border-primary/30 transition-colors">
          <div className="flex items-center text-muted-foreground gap-2">
            <FileWarning className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Failed Processing</span>
          </div>
          <div className="text-3xl font-semibold">{ai_statistics.submissions_failed}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Insights (The WOW Feature) */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">AI Insights</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 border-l-4 border-l-primary flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Recommendation
                  </h3>
                  <p className="text-sm font-medium leading-relaxed">{aiRecommendation}</p>
                </div>
                
                {common_mistakes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2 block">Top Mistakes</span>
                    <ul className="space-y-1.5">
                      {common_mistakes.slice(0,3).map((m, i) => (
                        <li key={i} className="text-sm flex items-center justify-between">
                          <span className="truncate pr-4 text-muted-foreground">• {m.mistake}</span>
                          <span className="text-xs font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{m.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>

              <div className="space-y-4">
                {bestGroup && (
                  <Card className="p-4 flex justify-between items-center bg-gradient-to-r from-green-500/10 to-transparent border-green-500/20">
                    <div>
                      <div className="text-xs font-semibold text-green-600 uppercase tracking-wider flex items-center gap-1.5 mb-1"><TrendingUp className="w-3.5 h-3.5" /> Best Group</div>
                      <div className="font-medium">{bestGroup.group_name}</div>
                    </div>
                    <div className="text-xl font-bold text-green-700">{bestGroup.average_score} <span className="text-xs text-green-600/70">avg</span></div>
                  </Card>
                )}
                
                {weakestGroup && (
                  <Card className="p-4 flex justify-between items-center bg-gradient-to-r from-red-500/10 to-transparent border-red-500/20">
                    <div>
                      <div className="text-xs font-semibold text-red-600 uppercase tracking-wider flex items-center gap-1.5 mb-1"><TrendingDown className="w-3.5 h-3.5" /> Needs Attention</div>
                      <div className="font-medium">{weakestGroup.group_name}</div>
                    </div>
                    <div className="text-xl font-bold text-red-700">{weakestGroup.average_score} <span className="text-xs text-red-600/70">avg</span></div>
                  </Card>
                )}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <Link href="/assignments" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            
            <Card className="overflow-hidden">
              {recent_activity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No recent activity.</div>
              ) : (
                <div className="divide-y">
                  {recent_activity.map((activity, idx) => (
                    <Link 
                      key={idx} 
                      href={`/assignments/${activity.assignment_id}/submissions/${activity.submission_id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <div className="font-medium truncate">{activity.student}</div>
                        <div className="text-xs text-muted-foreground truncate">{activity.assignment} • {activity.group}</div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {activity.status === "checked" ? (
                          <div className="font-bold">{activity.score}</div>
                        ) : (
                          <div className="text-xs px-2 py-1 bg-muted rounded font-medium capitalize text-muted-foreground">{activity.status}</div>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Groups Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Groups Overview</h2>
            </div>
            
            <div className="space-y-3">
              {group_ranking.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground text-sm">No groups yet.</Card>
              ) : (
                group_ranking.map((group) => (
                  <Link key={group.group_id} href="/groups">
                    <Card className="p-4 flex items-center justify-between hover:border-primary/50 transition-colors group">
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors">{group.group_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Users className="w-3 h-3" /> {group.student_count} students</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{group.average_score}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Score</div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Students Needing Attention */}
          {student_ranking.length > 0 && (
            <section>
              <div className="flex items-center mb-4 gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold">Struggling Students</h2>
              </div>
              <Card className="divide-y">
                {/* Show bottom 3 students from ranking */}
                {[...student_ranking].reverse().slice(0, 4).map((student) => (
                  <div key={student.student_id} className="p-3 flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-medium truncate">{student.full_name}</span>
                      <span className="text-xs text-muted-foreground">{student.completed_assignments} tasks</span>
                    </div>
                    <div className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded shrink-0">
                      {student.average_score}
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          )}

        </div>
      </div>

    </div>
  );
}
