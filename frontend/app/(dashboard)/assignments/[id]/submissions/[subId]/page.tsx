"use client";

import { useParams, useRouter } from "next/navigation";
import { useTeacherSubmissions } from "@/features/assignments/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, Download, Printer } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(dateString));
};

export default function TeacherSubmissionResultPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const submissionId = params.subId as string;

  const { data: submissions, isLoading, isError } = useTeacherSubmissions();
  const submission = submissions?.find((s) => s.id === submissionId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse pt-8">
        <div className="h-10 w-32 bg-muted rounded mb-8"></div>
        <div className="h-64 bg-muted rounded-2xl mb-8"></div>
        <div className="space-y-4">
          <div className="h-24 bg-muted rounded-xl"></div>
          <div className="h-24 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !submission) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8">
        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <ErrorState message="Result not found." />
      </div>
    );
  }

  // Calculate color based on score
  const score = submission.score;
  let strokeColor = "text-green-500";
  if (score < 50) strokeColor = "text-red-500";
  else if (score < 80) strokeColor = "text-yellow-500";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 lg:p-12 pb-24 md:ml-64">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground" onClick={() => router.push(`/assignments/${assignmentId}`)}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Assignment
      </Button>

      {/* 1. Top Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        <div className="relative shrink-0 flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle cx="80" cy="80" r="70" className="stroke-muted fill-none" strokeWidth="8" />
            <circle 
              cx="80" 
              cy="80" 
              r="70" 
              className={`fill-none ${strokeColor} transition-all duration-1000 ease-out`} 
              strokeWidth="8" 
              strokeDasharray={439.8} 
              strokeDashoffset={439.8 - (439.8 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center md:text-left pt-2">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {submission.student_first_name} {submission.student_last_name}
          </h1>
          <div className="text-sm text-muted-foreground flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 mb-6">
            <span>{submission.assignment_title}</span>
            <span>•</span>
            <span>{submission.group_name}</span>
            <span>•</span>
            <span>{formatDateTime(submission.updated_at)}</span>
          </div>
          
          <div className="bg-muted/50 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> AI Summary
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {submission.feedback || "No summary provided by AI."}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mistakes Timeline */}
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-6">Mistakes Analysis</h2>
        
        {!submission.mistakes || submission.mistakes.length === 0 ? (
          <EmptyState icon={CheckCircle2} title="Perfect Work" description="No mistakes found in this submission." />
        ) : (
          <div className="relative border-l-2 border-muted ml-4 md:ml-6 space-y-10 pb-4">
            {submission.mistakes.map((mistake: Record<string, string>, index: number) => (
              <div key={index} className="relative pl-8 md:pl-10">
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-red-500 shadow-sm" />
                
                <Card className="p-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {mistake.question && (
                    <div className="mb-4">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Question</span>
                      <p className="font-medium text-sm">{mistake.question}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-muted/30 p-4 rounded-xl">
                    <div>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">Student Answer</span>
                      <p className="font-mono text-sm text-red-600 break-words">{mistake.student_answer || "—"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1">Correct Answer</span>
                      <p className="font-mono text-sm text-green-700 break-words">{mistake.correct_answer || "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    {mistake.ai_explanation && (
                      <div>
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Explanation</span>
                        <p className="text-sm text-muted-foreground leading-relaxed">{mistake.ai_explanation}</p>
                      </div>
                    )}
                    {mistake.suggestion && (
                      <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Suggestion</span>
                        <p className="text-sm text-blue-800 leading-relaxed">{mistake.suggestion}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Bottom Actions */}
      <div className="flex flex-wrap items-center gap-4 pt-6 border-t">
        <Button onClick={() => window.print()} className="gap-2 rounded-full px-6">
          <Printer className="w-4 h-4" /> Print Result
        </Button>
        <Button variant="outline" className="gap-2 rounded-full px-6" onClick={() => alert("PDF Download initiated (Demo)")}>
          <Download className="w-4 h-4" /> Download PDF
        </Button>
      </div>

    </div>
  );
}
