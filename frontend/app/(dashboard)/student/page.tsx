"use client";
import Link from "next/link";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { DashboardService, StudentDashboardData } from "@/services/dashboard.service";
import { Trophy, Users, User as UserIcon, Award, Phone, BookOpen, UserRound, Loader2, Activity } from "lucide-react";
import { UsersService, UserProfile } from "@/services/users.service";
import { useJoinGroup } from "@/features/groups/hooks";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function JoinGroupModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset } = useForm<{join_code: string, join_password: string}>();
  const joinMutation = useJoinGroup();

  useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);

  const onSubmit = (data: any) => {
    joinMutation.mutate(data, {
      onSuccess: () => {
        onClose();
        window.location.reload(); 
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 duration-200 p-4">
      <div className="w-full max-w-md bg-background border rounded-lg p-6 shadow-2xl animate-in zoom-in-95">
        <h2 className="text-lg font-bold mb-5">Guruhga qo'shilish</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Guruh ID</label>
            <Input placeholder="6 xonali raqam" {...register("join_code", { required: true })} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Parol</label>
            <Input placeholder="Guruh paroli" type="password" {...register("join_password", { required: true })} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="ghost" onClick={onClose} disabled={joinMutation.isPending}>Bekor qilish</Button>
            <Button type="submit" disabled={joinMutation.isPending}>
              {joinMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Qo'shilish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StudentHomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [teacherProfile, setTeacherProfile] = useState<UserProfile | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    DashboardService.getStudentDashboard()
      .then((dashboardData) => {
        setData(dashboardData);
        if (dashboardData.groups && dashboardData.groups.length > 0) {
          UsersService.getTeacherProfile(dashboardData.groups[0].id)
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
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.first_name}!</h1>
          <p className="text-muted-foreground mt-1">Here is an overview of your progress.</p>
        </div>
        <Button onClick={() => setIsJoinModalOpen(true)}>+ Guruhga qo'shilish</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data?.groups?.length ? (
          data.groups.map(group => (
            <div key={group.id} className="bg-card border rounded-xl p-5 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold line-clamp-1">{group.name}</p>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5" />
                    {group.teacher_name}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 bg-card border border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center text-muted-foreground">
            <Users className="w-12 h-12 mb-3 text-muted" />
            <p className="font-medium text-foreground mb-1">Hech qanday guruhga qo'shilmagansiz</p>
            <p className="text-sm mb-4">Ustozingizdan guruh parolini so'rang va tizimga kiriting.</p>
            <Button onClick={() => setIsJoinModalOpen(true)} variant="outline" size="sm">+ Guruhga qo'shilish</Button>
          </div>
        )}
      </div>
      
      {/* Overview Stats (Assignments & Ranking) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/assignments" className="bg-card border rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{data?.assignments?.pending?.length || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Yangi vazifalar</p>
        </Link>
        <Link href="/assignments" className="bg-card border rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">{data?.assignments?.submitted?.length || 0}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Tekshirilmoqda</p>
        </Link>
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">#{data?.my_rank || '-'}</p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">Sizning o'rningiz</p>
        </div>
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center items-center text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold flex items-center gap-1">
            {data?.rank_change && data.rank_change > 0 ? '+' : ''}{data?.rank_change || 0}
          </p>
          <p className="text-xs text-muted-foreground uppercase font-semibold">O'zgarish</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-muted/50 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="font-semibold text-lg">Asosiy guruh reytingi</h2>
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
      <JoinGroupModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </div>
  );
}
