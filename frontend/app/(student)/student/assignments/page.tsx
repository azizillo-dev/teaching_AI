"use client";

import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, ChevronRight, Clock, FileUp } from "lucide-react";
import { useStudentAssignments, useStudentSubmissions } from "@/features/assignments/hooks";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

const getDueDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const isPast = date.getTime() < today.getTime() && date.getDate() !== today.getDate();
  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
  
  if (isPast) return <span className="text-red-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Overdue</span>;
  if (isToday) return <span className="text-orange-500 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due Today</span>;
  if (isTomorrow) return <span className="text-yellow-600 font-medium flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due Tomorrow</span>;
  return <span className="text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Due {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}</span>;
};

export default function StudentAssignmentsPage() {
  const { data: assignments, isLoading: isAssignmentsLoading, isError } = useStudentAssignments();
  const { data: submissions, isLoading: isSubmissionsLoading } = useStudentSubmissions();

  const isLoading = isAssignmentsLoading || isSubmissionsLoading;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64">
        <ErrorState message="Failed to load your assignments." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

      {assignments?.length === 0 ? (
        <EmptyState icon={BookOpen} title="No assignments" description="You have no homework assignments yet. Relax!" />
      ) : (
        <div className="space-y-4">
          {assignments?.map((assignment) => {
            const submission = submissions?.find(s => s.assignment === assignment.id);
            const isCompleted = submission && submission.status !== "pending";

            return (
              <Link key={assignment.id} href={`/student/assignments/${assignment.id}`} className="block">
                <div className={`bg-card border rounded-xl p-5 flex flex-col justify-between hover:border-primary/50 transition-colors ${isCompleted ? 'opacity-70 bg-muted/20' : 'shadow-sm'}`}>
                  
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg leading-tight ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {assignment.title}
                    </h3>
                    
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-green-100 text-green-700 text-xs font-bold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" /> 
                        {submission.status === 'checked' ? `${submission.score}/100` : 'Submitted'}
                      </span>
                    ) : (
                      <span className="text-xs shrink-0">
                        {getDueDateLabel(assignment.deadline)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {assignment.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                      {assignment.group_name}
                    </span>
                    
                    <div className={`flex items-center text-sm font-medium ${isCompleted ? 'text-muted-foreground' : 'text-primary'}`}>
                      {isCompleted ? 'View Result' : <><FileUp className="w-4 h-4 mr-1.5" /> Upload Work</>}
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
