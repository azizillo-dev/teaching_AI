"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { DashboardService, StudentDashboardData } from "@/services/dashboard.service";
import { Trophy, Users, User as UserIcon, Award, Phone, BookOpen, UserRound } from "lucide-react";
import { UsersService, UserProfile } from "@/services/users.service";

export default function StudentHomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  useEffect(() => {
    DashboardService.getStudentDashboard()
      .then((dashboardData) => {
        setData(dashboardData);
        if (dashboardData.group_id) {
          UsersService.getTeacherProfile(dashboardData.group_id)
            .then(setTeacherProfile)
            .catch(console.error);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}!</h1>
        <p className="text-muted-foreground mt-1">Here is an overview of your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Your Group</p>
            <p className="text-lg font-bold line-clamp-1">{data?.group_name || "No Group Assigned"}</p>
          </div>
        </div>
        <div 
          className="bg-card border rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => {
            if (teacherProfile) setIsTeacherModalOpen(true);
          }}
        >
          <div className="w-12 h-12 rounded-full border bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden font-bold">
            {teacherProfile?.avatar ? (
              <img src={teacherProfile.avatar.startsWith("http") || teacherProfile.avatar.startsWith("blob:") ? teacherProfile.avatar : `http://localhost:8000${teacherProfile.avatar}`} alt="Ustoz" className="w-full h-full object-cover" />
            ) : teacherProfile ? (
              <span>{teacherProfile.first_name[0]}{teacherProfile.last_name[0]}</span>
            ) : (
              <UserIcon className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Your Teacher</p>
            <p className="text-lg font-bold line-clamp-1">{data?.teacher_name || "Unknown Teacher"}</p>
          </div>
        </div>
      </div>

      {/* Removed the inline Teacher Profile render here */}

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-muted/50 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-semibold text-lg">Group Leaderboard</h2>
        </div>
        
        {data?.leaderboard && data.leaderboard.length > 0 ? (
          <div className="divide-y">
            {data.leaderboard.map((student, index) => (
              <div 
                key={student.student_id} 
                className={`px-6 py-4 flex items-center justify-between ${student.is_me ? 'bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center font-bold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="font-medium flex items-center gap-2">
                    {student.full_name}
                    {student.is_me && <span className="text-[10px] uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">You</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">{Number(student.average_score || 0).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No students found in your group.
          </div>
        )}
      </div>
      {/* Teacher Profile Modal */}
      {isTeacherModalOpen && teacherProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsTeacherModalOpen(false)}>
          <div 
            className="bg-card w-full max-w-lg border rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-lg">O'qituvchi Ma'lumotlari</h2>
              </div>
              <button 
                onClick={() => setIsTeacherModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-3xl">
                  {teacherProfile.avatar ? (
                    <img src={teacherProfile.avatar.startsWith("http") || teacherProfile.avatar.startsWith("blob:") ? teacherProfile.avatar : `http://localhost:8000${teacherProfile.avatar}`} alt="Ustoz" className="w-full h-full object-cover" />
                  ) : (
                    <span>{teacherProfile.first_name[0]}{teacherProfile.last_name[0]}</span>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{teacherProfile.first_name} {teacherProfile.last_name}</h3>
                    <a href={`mailto:${teacherProfile.email}`} className="text-primary hover:underline text-sm font-medium">{teacherProfile.email}</a>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {teacherProfile.subject && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">Fan</p>
                          <p className="font-medium">{teacherProfile.subject}</p>
                        </div>
                      </div>
                    )}
                    {teacherProfile.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase">Telefon</p>
                          <a href={`tel:${teacherProfile.phone_number}`} className="font-medium hover:underline">{teacherProfile.phone_number}</a>
                        </div>
                      </div>
                    )}
                  </div>

                  {teacherProfile.bio && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">O'zi haqida</p>
                      <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">{teacherProfile.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
