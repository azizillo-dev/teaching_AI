"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, MoreHorizontal, Calendar, Users, BarChart3, CheckCircle2, Clock } from "lucide-react";
import { useTeacherAssignments, useStudentAssignments, useStudentSubmissions } from "@/features/assignments/hooks";
import { CreateAssignmentDialog, EditAssignmentDialog, DeleteAssignmentDialog } from "@/features/assignments/components/AssignmentDialogs";
import { Button } from "@/components/ui/button";
import { Assignment, Submission } from "@/features/assignments/schema";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/providers/AuthProvider";

const isPast = (date: Date) => date.getTime() < Date.now();
const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(dateString));
};

function TeacherAssignments() {
  const { data: assignments, isLoading, isError, refetch } = useTeacherAssignments();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editAssignment, setEditAssignment] = useState<Assignment | null>(null);
  const [deleteAssignment, setDeleteAssignment] = useState<Assignment | null>(null);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-40 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <ErrorState message="Failed to load assignments." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Barcha Vazifalar</h1>
          <p className="text-sm text-muted-foreground mt-1">Vazifalarni boshqarish va tekshirish</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          Yangi Vazifa
        </Button>
      </div>

      {assignments?.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Hozircha vazifalar yo'q"
          description="O'quvchilar uchun birinchi vazifani yarating."
          actionLabel="Yangi Vazifa"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments?.map((assignment) => {
            const isClosed = !assignment.is_active || isPast(new Date(assignment.deadline));
            const progressPercentage = assignment.total_students > 0 
              ? Math.round((assignment.submitted_count / assignment.total_students) * 100) 
              : 0;

            return (
              <div key={assignment.id} className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm shadow-sm transition-shadow flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700'}`}>
                      {isClosed ? 'Yopiq' : 'Faol'}
                    </span>
                    <div className="relative group/menu z-10">
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                      <div className="absolute right-0 top-full w-40 bg-popover border shadow-lg rounded-md py-1 text-sm font-medium opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                        <Link href={`/assignments/${assignment.id}`} className="block w-full text-left px-4 py-2 hover:bg-muted">Ochish</Link>
                        <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => setEditAssignment(assignment)}>Tahrirlash</button>
                        <button className="w-full text-left px-4 py-2 hover:bg-muted text-destructive" onClick={() => setDeleteAssignment(assignment)}>O'chirish</button>
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/assignments/${assignment.id}`} className="block">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{assignment.group_name}</p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Muddat: {formatDateTime(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{assignment.submitted_count} / {assignment.total_students} topshirdi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>O'rtacha ball: {Number(assignment.average_score || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                
                <div className="h-1.5 w-full bg-muted">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateAssignmentDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditAssignmentDialog isOpen={!!editAssignment} onClose={() => setEditAssignment(null)} assignment={editAssignment} />
      <DeleteAssignmentDialog isOpen={!!deleteAssignment} onClose={() => setDeleteAssignment(null)} assignment={deleteAssignment} />
    </div>
  );
}

function StudentAssignments() {
  const { data: assignments, isLoading, isError, refetch } = useStudentAssignments();
  const { data: submissions, isLoading: isSubmissionsLoading } = useStudentSubmissions();

  if (isLoading || isSubmissionsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-40 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <ErrorState message="Vazifalarni yuklashda xatolik yuz berdi." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Vazifalar</h1>
        <p className="text-sm text-muted-foreground mt-1">Ustozingiz bergan vazifalarni shu yerdan topasiz</p>
      </div>

      {assignments?.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Hozircha vazifalar yo'q"
          description="Guruhda hali vazifalar yaratilmagan."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments?.map((assignment) => {
            const isClosed = !assignment.is_active || isPast(new Date(assignment.deadline));
            const submission = submissions?.find(s => s.assignment === assignment.id);
            
            let statusLabel = "Yangi";
            let statusColor = "bg-blue-100 text-blue-700";
            
            if (submission) {
              if (submission.status === "checked") {
                statusLabel = "Tekshirildi";
                statusColor = "bg-green-100 text-green-700";
              } else if (submission.status === "checking" || submission.status === "submitted") {
                statusLabel = "Tekshirilmoqda";
                statusColor = "bg-yellow-100 text-yellow-700";
              } else if (submission.status === "failed") {
                statusLabel = "Xatolik";
                statusColor = "bg-red-100 text-red-700";
              }
            } else if (isClosed) {
              statusLabel = "Muddati o'tgan";
              statusColor = "bg-red-100 text-red-700";
            }

            return (
              <div key={assignment.id} className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-sm shadow-sm transition-shadow flex flex-col">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                      {statusLabel}
                    </span>
                    {submission?.status === "checked" && (
                      <span className="text-sm font-bold text-primary">{submission.score}/100</span>
                    )}
                  </div>
                  
                  <Link href={`/assignments/${assignment.id}`} className="block flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{assignment.group_name}</p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={isClosed && !submission ? "text-red-500 font-medium" : ""}>
                          Muddat: {formatDateTime(assignment.deadline)}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div className="pt-4 mt-4 border-t">
                    <Link href={`/assignments/${assignment.id}`} className="block w-full">
                      <Button variant="outline" className="w-full gap-2">
                        {submission?.status === "checked" ? (
                          <>Natijani ko'rish <CheckCircle2 className="w-4 h-4" /></>
                        ) : submission?.status === "checking" || submission?.status === "submitted" ? (
                          <>Holatni ko'rish <Clock className="w-4 h-4" /></>
                        ) : isClosed ? (
                          <>Vazifa yopilgan</>
                        ) : (
                          <>Vazifani bajarish</>
                        )}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const { user } = useAuth();
  
  if (user?.role === "student") {
    return <StudentAssignments />;
  }
  
  return <TeacherAssignments />;
}
