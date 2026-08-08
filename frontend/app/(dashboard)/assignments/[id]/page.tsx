"use client";

import { useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, FileText, AlertCircle, UploadCloud, X, Loader2, Sparkles, Image as ImageIcon, BookOpen } from "lucide-react";
import Link from "next/link";
import { useTeacherAssignment, useTeacherSubmissions, useStudentAssignment, useStudentSubmissions, useCreateSubmission, useUploadImages } from "@/features/assignments/hooks";
import { useStudents } from "@/features/students/hooks";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { useAuth } from "@/providers/AuthProvider";
import { getMediaUrl } from "@/utils/media";

const formatDateTime = (dateString: string) => {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "numeric" }).format(new Date(dateString));
};

function TeacherAssignmentDetails({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const { data: assignment, isLoading: isAssignmentLoading } = useTeacherAssignment(assignmentId);
  const { data: allSubmissions, isLoading: isSubmissionsLoading } = useTeacherSubmissions();
  const { data: allStudents, isLoading: isStudentsLoading } = useStudents();

  const [activeTab, setActiveTab] = useState<"submitted" | "pending">("submitted");

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
        <ErrorState message="Vazifa topilmadi." onRetry={() => router.push("/assignments")} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <Button variant="ghost" onClick={() => router.push("/assignments")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vazifalarga qaytish
      </Button>

      <div className="bg-card border rounded-xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${assignment.is_active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                {assignment.is_active ? 'Faol' : 'Yopiq'}
              </span>
              <span className="text-sm font-medium text-muted-foreground bg-muted/50 px-2.5 py-0.5 rounded">
                {assignment.group_name}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{assignment.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap max-w-3xl mb-4">
              {assignment.description || "Tavsif kiritilmagan."}
            </p>
            {assignment.image && (
              <div className="mt-4">
                <p className="font-semibold text-sm mb-2 text-muted-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Ilova qilingan topshiriq:
                </p>
                {assignment.image.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                  <div className="rounded-xl border overflow-hidden inline-block bg-muted/30 max-w-sm">
                    <a href={getMediaUrl(assignment.image)} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                      <img 
                        src={getMediaUrl(assignment.image)} 
                        alt="Topshiriq rasmi" 
                        className="w-full h-auto max-h-[300px] object-contain"
                      />
                    </a>
                  </div>
                ) : (
                  <a href={getMediaUrl(assignment.image)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
                    <FileText className="w-4 h-4" />
                    Biriktirilgan faylni ochish
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 md:gap-8 bg-muted/30 p-4 rounded-lg md:bg-transparent md:p-0">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Topshirdi</p>
              <p className="text-2xl font-bold flex items-baseline gap-1">
                {assignment.submitted_count}
                <span className="text-sm font-normal text-muted-foreground">/ {assignment.total_students}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">O'rtacha ball</p>
              <p className="text-2xl font-bold text-primary">{Number(assignment.average_score || 0).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b mb-6">
        <button 
          onClick={() => setActiveTab("submitted")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${activeTab === "submitted" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Topshirganlar ({submissions.length})
          {activeTab === "submitted" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2.5 font-medium text-sm transition-colors relative ${activeTab === "pending" ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Topshirmaganlar ({pendingStudents.length})
          {activeTab === "pending" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
        </button>
      </div>

      {activeTab === "submitted" && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <EmptyState icon={FileText} title="Hali hech kim topshirmadi" description="O'quvchilar javoblarini yuklashini kuting." />
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
                        {sub.status === 'checked' ? `${sub.score}/100` : 'Tekshirilmoqda'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4 mb-4">
                      <Clock className="w-3.5 h-3.5" />
                      Yuborildi: {formatDateTime(sub.updated_at)}
                    </div>
                  </div>
                  <Link href={`/assignments/${assignment.id}/submissions/${sub.id}`} className="block mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 rounded-lg"
                      type="button"
                    >
                      {sub.status === "checked" ? "Natijani ko'rish" : "Javobni ko'rish"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <div className="space-y-4">
          {pendingStudents.length === 0 ? (
            <div className="p-12 text-center border rounded-xl bg-card">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">Hamma topshirdi!</h3>
              <p className="text-muted-foreground">Guruhdagi barcha faol o'quvchilar vazifani bajarib bo'ldi.</p>
            </div>
          ) : (
            <div className="bg-card border rounded-xl overflow-hidden divide-y divide-border">
              {pendingStudents.map(student => (
                <div key={student.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {student.first_name?.[0] || ""}{student.last_name?.[0] || ""}
                    </div>
                    <span className="font-medium text-foreground truncate">{student.first_name || "Noma'lum"} {student.last_name || ""}</span>
                  </div>
                  <div className="text-amber-600 font-medium flex items-center gap-1.5 text-sm bg-amber-500/10 px-2.5 py-1 rounded-md shrink-0">
                    <AlertCircle className="w-4 h-4" /> Kutilmoqda
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

function StudentAssignmentDetails({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const { data: assignment, isLoading: isAssignmentLoading } = useStudentAssignment(assignmentId);
  const { data: submissions, isLoading: isSubmissionsLoading } = useStudentSubmissions(3000); // poll every 3s
  
  const createSubmission = useCreateSubmission();
  const uploadImages = useUploadImages();
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const submission = useMemo(() => {
    if (!submissions) return null;
    return submissions.find(s => s.assignment === assignmentId);
  }, [submissions, assignmentId]);

  const isLoading = isAssignmentLoading || isSubmissionsLoading;

  if (isLoading && !assignment) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-pulse">
        <div className="h-8 w-24 bg-muted rounded mb-6"></div>
        <div className="h-48 w-full bg-muted rounded-xl mb-8"></div>
        <div className="h-64 w-full bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <ErrorState message="Vazifa topilmadi." onRetry={() => router.push("/assignments")} />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const validFiles = filesArray.filter(f => f.type.startsWith('image/'));
      if (validFiles.length !== filesArray.length) {
        setUploadError("Faqat rasm fayllari qabul qilinadi.");
      } else {
        setUploadError(null);
      }
      setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // max 5 images
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    
    try {
      // 1. Create Submission
      const newSubmission = await createSubmission.mutateAsync(assignment.id);
      
      // 2. Upload Images
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append("images", file);
      });
      
      await uploadImages.mutateAsync({ submissionId: newSubmission.id, formData });
      
      setSelectedFiles([]);
    } catch (err: any) {
      setUploadError(err?.message || "Yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setIsUploading(false);
    }
  };

  const isChecking = submission?.status === "submitted" || submission?.status === "checking";
  const isChecked = submission?.status === "checked";
  const isPast = new Date(assignment.deadline).getTime() < Date.now();
  const canSubmit = !submission && !isPast && assignment.is_active;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <Button variant="ghost" onClick={() => router.push("/assignments")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Vazifalarga qaytish
      </Button>

      <div className="bg-card border rounded-xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
            {assignment.group_name}
          </span>
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Muddat: {formatDateTime(assignment.deadline)}
          </span>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{assignment.title}</h1>
        
        {assignment.description && (
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground mb-6">
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </div>
        )}

        {(assignment.book && assignment.page_start && assignment.page_end) && (
          <div className="bg-muted/50 p-4 rounded-lg flex items-start gap-3 border mb-6">
            <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Kitobdan vazifa</p>
              <p className="text-sm text-muted-foreground">Sahifalar: {assignment.page_start} - {assignment.page_end}</p>
            </div>
          </div>
        )}

        {assignment.image && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" /> 
              Ilova qilingan topshiriq:
            </h3>
            {assignment.image.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
              <div className="rounded-xl border overflow-hidden bg-muted/30 max-w-sm inline-block">
                <a href={getMediaUrl(assignment.image)} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                  <img 
                    src={getMediaUrl(assignment.image)} 
                    alt="Topshiriq rasmi" 
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                </a>
              </div>
            ) : (
              <a href={getMediaUrl(assignment.image)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg bg-card hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
                <FileText className="w-4 h-4" />
                Biriktirilgan faylni ochish
              </a>
            )}
          </div>
        )}
      </div>

      {!submission && canSubmit && (
        <div className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-primary" />
            Javobni yuklash
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Daftaringizga yozilgan javoblarni rasmga olib yuklang (maksimum 5 ta rasm).
          </p>
          
          {uploadError && (
            <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{uploadError}</p>
            </div>
          )}

          <div 
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept="image/*" 
              onChange={handleFileChange}
            />
            <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">Rasmlarni tanlash uchun shu yerga bosing</p>
            <p className="text-xs text-muted-foreground">JPG, PNG (max 10MB)</p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Tanlangan rasmlar ({selectedFiles.length}/5):</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {selectedFiles.map((file, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted">
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              disabled={selectedFiles.length === 0 || isUploading}
              className="w-full md:w-auto min-w-[150px]"
            >
              {isUploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yuklanmoqda...</>
              ) : (
                "Yuborish va Tekshirish"
              )}
            </Button>
          </div>
        </div>
      )}

      {isChecking && (
        <div className="bg-card border rounded-xl p-12 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            Sun'iy intellekt tekshirmoqda <Sparkles className="w-5 h-5 text-yellow-500" />
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Javoblaringiz yuklandi. Hozirda AI ustozingiz javoblaringizni tahlil qilmoqda. Bu bir necha soniya vaqt oladi.
          </p>
        </div>
      )}

      {isChecked && (
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-bold ${submission.score >= 80 ? 'bg-green-100 text-green-600' : submission.score >= 60 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
              {submission.score}
            </div>
            <h2 className="text-2xl font-bold mb-2">Natija tayyor!</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              {submission.feedback}
            </p>
          </div>
          
          {submission.mistakes && submission.mistakes.length > 0 && (
            <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
              <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20">
                <h3 className="font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Xatolar ustida ishlash
                </h3>
              </div>
              <div className="divide-y divide-border">
                {submission.mistakes.map((mistake: any, idx: number) => (
                  <div key={idx} className="p-6">
                    <div className="mb-4">
                      <p className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">Savol yoki Kontekst</p>
                      <p className="font-medium text-foreground">{mistake.question || "Umumiy xato"}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/10">
                        <p className="font-medium text-xs text-red-700 uppercase tracking-wider mb-1">Sizning javobingiz</p>
                        <p className="text-sm">{mistake.student_answer || "-"}</p>
                      </div>
                      <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/10">
                        <p className="font-medium text-xs text-green-700 uppercase tracking-wider mb-1">To'g'ri javob</p>
                        <p className="text-sm">{mistake.correct_answer || "-"}</p>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/10 mb-4">
                      <p className="font-medium text-xs text-blue-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> AI Tushuntirishi
                      </p>
                      <p className="text-sm leading-relaxed">{mistake.ai_explanation}</p>
                    </div>
                    
                    {mistake.suggestion && (
                      <div>
                        <p className="font-medium text-xs text-orange-700 uppercase tracking-wider mb-1">Maslahat</p>
                        <p className="text-sm text-muted-foreground">{mistake.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!submission && !canSubmit && (
        <div className="bg-card border rounded-xl p-12 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-bold mb-2">Vazifa yopilgan</h2>
          <p className="text-muted-foreground">Bu vazifaga javob yuborish muddati tugagan yoki vazifa faol emas.</p>
        </div>
      )}
    </div>
  );
}

export default function AssignmentDetailsPage() {
  const { user } = useAuth();
  const params = useParams();
  const assignmentId = params.id as string;
  
  if (user?.role === "student") {
    return <StudentAssignmentDetails assignmentId={assignmentId} />;
  }
  return <TeacherAssignmentDetails assignmentId={assignmentId} />;
}
