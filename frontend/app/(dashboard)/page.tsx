"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/services/users.service";
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
  
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => UsersService.getProfile(),
  });

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
  let aiRecommendation = "O'quvchilaringiz barqaror natija ko'rsatmoqda. Shu ruhda davom eting!";
  if (common_mistakes && common_mistakes.length > 0) {
    aiRecommendation = `Ko'pchilik o'quvchilar "${common_mistakes[0].mistake}" qismida qiynalmoqda. Keyingi darsda shu mavzuni qaytarishni tavsiya qilamiz.`;
  }

  const weakestGroup = group_ranking && group_ranking.length > 0 ? group_ranking[group_ranking.length - 1] : null;
  const bestGroup = group_ranking && group_ranking.length > 0 ? group_ranking[0] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Xush kelibsiz, {profile ? profile.first_name : user?.first_name || "O'qituvchi"}</h1>
          <p className="text-sm text-muted-foreground mt-1">Bugungi kunlik hisobotingiz.</p>
        </div>
      </div>

      {/* 2. Today's Overview (Quick Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 md:p-5 flex flex-col gap-2 rounded-lg shadow-sm border-border">
          <div className="flex items-center text-muted-foreground gap-1.5 md:gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">Kutilmoqda</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold">{ai_statistics.submissions_pending}</div>
        </Card>
        
        <Card className="p-4 md:p-5 flex flex-col gap-2 rounded-lg shadow-sm border-border">
          <div className="flex items-center text-muted-foreground gap-1.5 md:gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">AI Navbati</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold">{ai_statistics.submissions_pending}</div>
        </Card>

        <Card className="p-4 md:p-5 flex flex-col gap-2 rounded-lg shadow-sm border-border">
          <div className="flex items-center text-muted-foreground gap-1.5 md:gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">Tekshirildi</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold">{ai_statistics.submissions_checked}</div>
        </Card>

        <Card className="p-4 md:p-5 flex flex-col gap-2 rounded-lg shadow-sm border-border">
          <div className="flex items-center text-muted-foreground gap-1.5 md:gap-2">
            <FileWarning className="w-4 h-4 shrink-0" />
            <span className="text-xs md:text-sm font-medium truncate">Xatolar</span>
          </div>
          <div className="text-2xl md:text-3xl font-bold">{ai_statistics.submissions_failed}</div>
        </Card>
      </div>

      {/* AI Recommendation Alert */}
      <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-sm flex items-start gap-3">
        <BrainCircuit className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold mb-1">Sun'iy Intellekt Maslahati</h3>
          <p className="text-sm text-primary-foreground/90">{aiRecommendation}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">So'nggi faollik</h2>
              <Link href="/assignments" className="text-xs text-muted-foreground hover:text-foreground font-medium shrink-0 ml-2">
                View all &rarr;
              </Link>
            </div>
            
            <Card className="overflow-hidden rounded-lg shadow-sm border-border">
              {recent_activity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">Hozircha so'nggi faollik mavjud emas.</div>
              ) : (
                <div className="divide-y divide-border">
                  {recent_activity.map((activity, idx) => (
                    <Link 
                      key={idx} 
                      href={`/assignments/${activity.assignment_id}/submissions/${activity.submission_id}`}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                        <div className="font-medium text-sm text-foreground truncate">{activity.student}</div>
                        <div className="text-xs text-muted-foreground truncate">{activity.assignment} • {activity.group}</div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {activity.status === "checked" ? (
                          <div className="font-semibold text-sm">{activity.score}</div>
                        ) : (
                          <div className="text-xs px-2 py-0.5 bg-muted rounded font-medium text-muted-foreground">{activity.status}</div>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* Top Mistakes */}
          {common_mistakes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Ko'p qilingan xatolar</h2>
              </div>
              <Card className="rounded-lg shadow-sm border-border overflow-hidden">
                <div className="divide-y divide-border">
                  {common_mistakes.slice(0,4).map((m, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between">
                      <span className="text-sm text-foreground truncate pr-4">{m.mistake}</span>
                      <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground shrink-0">{m.count} ta takrorlangan</span>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Students Needing Attention */}
          <section>
            <div className="flex items-center mb-3 justify-between">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">E'tibor talab qiladi</h2>
              <Link href="/students" className="text-xs text-muted-foreground hover:text-foreground font-medium shrink-0 ml-2">
                View all &rarr;
              </Link>
            </div>
            {student_ranking.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground text-sm rounded-lg shadow-sm border-border">Ma'lumot yo'q.</Card>
            ) : (
              <Card className="divide-y divide-border rounded-lg shadow-sm border-border overflow-hidden">
                {[...student_ranking].reverse().slice(0, 5).map((student) => (
                  <div key={student.student_id} className="p-4 flex items-center justify-between">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-sm font-medium text-foreground truncate">{student.full_name}</span>
                      <span className="text-xs text-muted-foreground">{student.completed_assignments} ta vazifa bajarilgan</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground bg-muted px-2 py-1 rounded shrink-0">
                      Baho: {student.average_score}
                    </div>
                  </div>
                ))}
              </Card>
            )}
          </section>

          {/* Groups Overview */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">Eng yaxshi guruhlar</h2>
              <Link href="/groups" className="text-xs text-muted-foreground hover:text-foreground font-medium shrink-0 ml-2">
                View all &rarr;
              </Link>
            </div>
            
            <div className="space-y-2">
              {group_ranking.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground text-sm rounded-lg shadow-sm border-border">Hozircha guruhlar yo'q.</Card>
              ) : (
                group_ranking.map((group) => (
                  <Link key={group.group_id} href="/groups">
                    <Card className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg shadow-sm border-border group">
                      <div>
                        <div className="font-medium text-sm text-foreground">{group.group_name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Users className="w-3 h-3" /> {group.student_count} o'quvchi</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm text-foreground">{group.average_score}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">O'rtacha</div>
                      </div>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </section>

        </div>
      </div>

    </div>
  );
}
