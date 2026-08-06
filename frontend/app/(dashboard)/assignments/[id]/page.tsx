"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTeacherAssignment, useTeacherSubmissions } from "@/features/assignments/hooks";
import { useStudents } from "@/features/students/hooks";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(dateString));
};

export default function AssignmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { data: assignment, isLoading: isAssignmentLoading } = useTeacherAssignment(assignmentId);
  const { data: allSubmissions, isLoading: isSubmissionsLoading } = useTeacherSubmissions();
  const { data: allStudents, isLoading: isStudentsLoading } = useStudents();

  const [activeTab, setActiveTab] = useState<"submitted" | "pending">("submitted");

  // Derived state
  const submissions = useMemo(() => {
    if (!allSubmissions) return [];
    return allSubmissions.filter(s => s.assignment === assignmentId && s.status !== "pending");
  }, [allSubmissions, assignmentId]);

  const pendingStudents = useMemo(() => {
    if (!allStudents || !assignment || !allSubmissions) return [];
    const groupStudents = allStudents.filter(s => s.group_name === assignment.group_name && s.is_active);
    const submittedStudentIds = submissions.map(s => s.student_id);
    return groupStudents.filter(s => !submittedStudentIds.includes(s.id));
  }, [allStudents, assignment, allSubmissions, submissions]);

  const isLoading = isAssignmentLoading || isSubmissionsLoading || isStudentsLoading;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8 animate-pulse">
        <div className="h-8 w-24 bg-muted rounded mb-6"></div>
        <div className="h-32 w-full bg-muted rounded-xl mb-8"></div>
        <div className="h-10 w-48 bg-muted rounded mb-6"></div>
        <div className="h-64 w-full bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <ErrorState message="Assignment not found." onRetry={() => router.push("/assignments")} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      {/* Back button */}
      <Button variant="ghost" onClick={() => router.push("/assignments")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Assignments
      </Button>

      {/* Header Summary */}
      <div className="bg-card border rounded-xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${assignment.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {assignment.is_active ? 'Active' : 'Closed'}
              </span>
              <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded">
                {assignment.group_name}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{assignment.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap max-w-3xl">
              {assignment.description || "No description provided."}
            </p>
          </div>
          
          <div className="flex gap-4 md:gap-8 bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Submitted</p>
              <p className="text-2xl font-bold flex items-baseline gap-1">
                {assignment.submitted_count}
                <span className="text-sm font-normal text-muted-foreground">/ {assignment.total_students}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Avg Score</p>
              <p className="text-2xl font-bold text-primary">{(assignment.average_score || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <button 
          onClick={() => setActiveTab("submitted")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${activeTab === "submitted" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Submitted ({submissions.length})
          {activeTab === "submitted" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${activeTab === "pending" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Pending ({pendingStudents.length})
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {/* Tab Content: Submitted */}
      {activeTab === "submitted" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <EmptyState icon={FileText} title="No submissions yet" description="Students have not uploaded their homework yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map(sub => (
                <div key={sub.id} className="bg-card border rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {sub.student_first_name?.[0]}{sub.student_last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold leading-tight">{sub.student_first_name} {sub.student_last_name}</h3>
                          <p className="text-xs text-muted-foreground">{sub.student_email}</p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${sub.status === 'checked' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {sub.status === 'checked' ? `${sub.score}/100` : 'Checking'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4 mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      Submitted {formatDateTime(sub.updated_at)}
                    </div>
                  </div>
                  <Link href={`/assignments/${assignment.id}/submissions/${sub.id}`} className="block mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 rounded-lg"
                      type="button"
                    >
                      {sub.status === "checked" ? "View Result" : "Review Student Work"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Pending */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingStudents.length === 0 ? (
            <div className="p-12 text-center border rounded-xl bg-card">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">Everyone submitted!</h3>
              <p className="text-muted-foreground">All active students in this group have uploaded their homework.</p>
            </div>
          ) : (
            <div className="bg-card border rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Student</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Email</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pendingStudents.map(student => (
                    <tr key={student.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-xs uppercase">
                            {student.first_name[0]}{student.last_name[0]}
                          </div>
                          <span className="font-medium">{student.first_name} {student.last_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                      <td className="px-6 py-4 text-amber-600 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Pending
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
