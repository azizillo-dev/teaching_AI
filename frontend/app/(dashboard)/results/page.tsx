"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Crown, Calendar, Trophy, Medal } from "lucide-react";
import { DashboardService } from "@/services/dashboard.service";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function ResultsPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["teacher-analytics", selectedGroupId],
    queryFn: () => DashboardService.getTeacherAnalytics(selectedGroupId),
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 animate-pulse space-y-8 h-full">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 h-full">
        <ErrorState message="Failed to load analytics." onRetry={() => refetch()} />
      </div>
    );
  }

  const topStudents = data?.top_students || [];
  
  // Arrange top 3 for podium (2, 1, 3)
  const podiumOrder = [
    topStudents[1] || null, // 2nd place
    topStudents[0] || null, // 1st place
    topStudents[2] || null, // 3rd place
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hisobotlar va Natijalar</h1>
          <p className="text-sm text-muted-foreground mt-1">O'quvchilarning o'zlashtirishini kuzatib boring</p>
        </div>
        
        {data?.groups && data.groups.length > 0 && (
          <div className="w-full md:w-64">
            <select 
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm"
              value={selectedGroupId || data.selected_group_id || ""}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {data.groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!data?.selected_group_id ? (
        <EmptyState 
          icon={Users} 
          title="Guruh tanlanmagan" 
          description="Hisobotlarni ko'rish uchun guruh tanlang yoki unga a'zo qo'shing." 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Top 3 Podium */}
          <div className="col-span-1 lg:col-span-3 bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500 shrink-0" />
              <span>{data.selected_group_name} Top 3</span>
            </h2>
            
            {topStudents.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Bu guruhda faol o'quvchilar topilmadi.
              </div>
            ) : (
              <div className="w-full overflow-x-auto overflow-y-visible pb-4 pt-2">
                <div className="flex items-end justify-center min-w-max gap-1 md:gap-2 mt-4 px-2">
                  
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center w-20 md:w-28 transition-all">
                    {podiumOrder[0] && (
                      <div className="flex flex-col items-center mb-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border-2 border-slate-200 shadow-sm">
                          {podiumOrder[0].initials}
                        </div>
                        <div className="text-center mt-1">
                          <p className="font-semibold text-xs truncate w-16 md:w-24 px-1 text-foreground" title={podiumOrder[0].full_name}>
                            {podiumOrder[0].full_name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">{podiumOrder[0].average_score}</p>
                        </div>
                      </div>
                    )}
                    <div className="w-full bg-slate-100 rounded-t-md h-16 md:h-24 flex items-start pt-2 justify-center border-t-2 border-slate-300 shadow-sm">
                      <span className="text-xl font-bold text-slate-400">2</span>
                    </div>
                  </div>

                  {/* 1st Place */}
                  <div className="flex flex-col items-center w-24 md:w-32 z-10 -mx-1 md:-mx-2 transition-all">
                    {podiumOrder[1] && (
                      <div className="flex flex-col items-center mb-2">
                        <div className="relative">
                          <Crown className="w-5 h-5 text-yellow-500 absolute -top-3 left-1/2 -translate-x-1/2 drop-shadow-sm fill-yellow-500" />
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold text-base md:text-lg border-2 border-yellow-400 shadow-md">
                            {podiumOrder[1].initials}
                          </div>
                        </div>
                        <div className="text-center mt-1">
                          <p className="font-bold text-xs md:text-sm truncate w-20 md:w-28 px-1 text-foreground" title={podiumOrder[1].full_name}>
                            {podiumOrder[1].full_name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] md:text-xs text-yellow-600 font-bold">{podiumOrder[1].average_score}</p>
                        </div>
                      </div>
                    )}
                    <div className="w-full bg-yellow-50 rounded-t-md h-24 md:h-32 flex items-start pt-2 justify-center border-t-4 border-yellow-400 shadow-[0_-4px_10px_rgba(250,204,21,0.15)]">
                      <span className="text-2xl font-black text-yellow-400">1</span>
                    </div>
                  </div>

                  {/* 3rd Place */}
                  <div className="flex flex-col items-center w-20 md:w-28 transition-all">
                    {podiumOrder[2] && (
                      <div className="flex flex-col items-center mb-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center font-bold text-sm border-2 border-orange-200 shadow-sm">
                          {podiumOrder[2].initials}
                        </div>
                        <div className="text-center mt-1">
                          <p className="font-semibold text-xs truncate w-16 md:w-24 px-1 text-foreground" title={podiumOrder[2].full_name}>
                            {podiumOrder[2].full_name.split(' ')[0]}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium">{podiumOrder[2].average_score}</p>
                        </div>
                      </div>
                    )}
                    <div className="w-full bg-orange-50 rounded-t-md h-12 md:h-16 flex items-start pt-2 justify-center border-t-2 border-orange-300 shadow-sm">
                      <span className="text-xl font-bold text-orange-300">3</span>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* Weekly Stats */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-md font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Haftalik Hisobot (Oxirgi 7 kun)
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bajarganlar</span>
                  <span className="font-bold text-green-600">{data.weekly_stats.completed}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${data.weekly_stats.total > 0 ? (data.weekly_stats.completed / data.weekly_stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bajarmaganlar</span>
                  <span className="font-bold text-red-500">{data.weekly_stats.not_completed}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-full" 
                    style={{ width: `${data.weekly_stats.total > 0 ? (data.weekly_stats.not_completed / data.weekly_stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Umumiy kutilayotgan:</span>
                  <span className="font-semibold text-foreground">{data.weekly_stats.total} ta vazifa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-md font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Oylik Hisobot (Oxirgi 30 kun)
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bajarganlar</span>
                  <span className="font-bold text-green-600">{data.monthly_stats.completed}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${data.monthly_stats.total > 0 ? (data.monthly_stats.completed / data.monthly_stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Bajarmaganlar</span>
                  <span className="font-bold text-red-500">{data.monthly_stats.not_completed}</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-full" 
                    style={{ width: `${data.monthly_stats.total > 0 ? (data.monthly_stats.not_completed / data.monthly_stats.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Umumiy kutilayotgan:</span>
                  <span className="font-semibold text-foreground">{data.monthly_stats.total} ta vazifa</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
