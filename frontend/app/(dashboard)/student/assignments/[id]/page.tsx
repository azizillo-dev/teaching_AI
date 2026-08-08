"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, X, CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useStudentAssignments, useStudentSubmissions, useCreateSubmission, useUploadImages } from "@/features/assignments/hooks";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/ErrorState";

export default function StudentHomeworkUploadPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const { data: assignments, isLoading: isAssignmentsLoading } = useStudentAssignments();
  const { data: submissions, isLoading: isSubmissionsLoading } = useStudentSubmissions(3000); // Poll every 3s
  const createMutation = useCreateSubmission();
  const uploadMutation = useUploadImages();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignment = assignments?.find(a => a.id === assignmentId);
  const submission = submissions?.find(s => s.assignment === assignmentId);

  // Generate previews using useMemo to avoid setState in effect
  const previews = useMemo(() => {
    return selectedFiles.map(file => URL.createObjectURL(file));
  }, [selectedFiles]);

  // Clean up ObjectURLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  if (isAssignmentsLoading || isSubmissionsLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 md:ml-64 pt-8 animate-pulse">
        <div className="h-8 w-1/2 bg-muted rounded mb-4"></div>
        <div className="h-4 w-3/4 bg-muted rounded mb-12"></div>
        <div className="h-64 w-full bg-muted rounded-xl"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
        <ErrorState message="Assignment not found." onRetry={() => router.push("/student/assignments")} />
      </div>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      // 1. Ensure submission object exists (create if not)
      let subId = submission?.id;
      if (!subId) {
        const newSub = await createMutation.mutateAsync(assignmentId);
        subId = newSub.id;
      }

      // 2. Upload images
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });
      await uploadMutation.mutateAsync({ submissionId: subId, formData });
      
      // Cleanup UI
      setSelectedFiles([]);
      
    } catch (error) {
      console.error("Upload failed", error);
      // Let React Query handle the error boundary or we can show a local toast
    }
  };

  const isUploading = createMutation.isPending || uploadMutation.isPending;

  // --- RENDERING STATES ---

  // State 1: Submitted & Processing (Polling)
  if (submission && (submission.status === "submitted" || submission.status === "checking")) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 md:ml-64 pt-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Button variant="ghost" onClick={() => router.push("/student/assignments")} className="absolute top-4 left-4 md:top-8 md:left-[17rem] text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Homework Submitted!</h2>
        <p className="text-muted-foreground max-w-sm">The AI is currently analyzing and checking your work. This usually takes just a few seconds.</p>
        <div className="mt-8 px-4 py-2 bg-muted rounded-full text-sm font-medium animate-pulse text-muted-foreground">
          Checking your work...
        </div>
      </div>
    );
  }

  // State 2: Checked & Finalized (Student Result Page)
  if (submission && submission.status === "checked") {
    const score = submission.score;
    let statusConfig = { color: "text-green-500", bg: "bg-green-100", label: "Excellent Work!", icon: Sparkles };
    if (score < 50) statusConfig = { color: "text-red-500", bg: "bg-red-100", label: "Needs More Practice", icon: AlertCircle };
    else if (score < 80) statusConfig = { color: "text-yellow-500", bg: "bg-yellow-100", label: "Good Progress", icon: CheckCircle2 };

    const StatusIcon = statusConfig.icon;

    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 md:ml-64 pt-8 pb-24">
        <Button variant="ghost" onClick={() => router.push("/student/assignments")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
        
        {/* Top Result Banner */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <div className="relative shrink-0 flex items-center justify-center mb-6">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" className="stroke-muted fill-none" strokeWidth="8" />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                className={`fill-none ${statusConfig.color} transition-all duration-1000 ease-out`} 
                strokeWidth="8" 
                strokeDasharray={351.8} 
                strokeDashoffset={351.8 - (351.8 * score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold">{score}</span>
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold mb-4 ${statusConfig.bg} ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4" /> {statusConfig.label}
          </div>
          
          <p className="text-muted-foreground text-sm max-w-sm leading-relaxed px-4">
            {submission.feedback || "Your homework has been checked."}
          </p>
        </div>

        {/* Mistakes Review */}
        {submission.mistakes && submission.mistakes.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg font-bold mb-6 border-b pb-2">What to improve next</h3>
            <div className="space-y-6">
              {submission.mistakes.map((mistake: Record<string, string>, idx: number) => (
                <div key={idx} className="bg-card border rounded-xl p-5 shadow-sm">
                  {mistake.question && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Question</span>
                      <p className="font-medium text-sm">{mistake.question}</p>
                    </div>
                  )}
                  <div className="bg-red-50/50 p-3 rounded-lg border border-red-100 mb-3">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">Your Answer</span>
                    <p className="font-mono text-sm text-red-600 line-through">{mistake.student_answer || "—"}</p>
                  </div>
                  <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 mb-4">
                    <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1">Correct Answer</span>
                    <p className="font-mono text-sm text-green-700">{mistake.correct_answer || "—"}</p>
                  </div>
                  {(mistake.ai_explanation || mistake.suggestion) && (
                    <div className="text-sm text-muted-foreground space-y-2 pt-2 border-t">
                      {mistake.ai_explanation && <p><strong className="text-foreground">Why: </strong>{mistake.ai_explanation}</p>}
                      {mistake.suggestion && <p><strong className="text-foreground">Tip: </strong>{mistake.suggestion}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submitted Images */}
        <div>
          <h3 className="text-lg font-bold mb-4 border-b pb-2">Your Work</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {submission.images.map((img, i) => (
              <div key={img.id} className="border rounded-lg overflow-hidden aspect-[3/4] bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.image} alt={`Page ${i+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // State 3: Upload Mode (Pending)
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
      <Button variant="ghost" onClick={() => router.push("/student/assignments")} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-muted-foreground whitespace-pre-wrap">{assignment.description || "No specific instructions."}</p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        {selectedFiles.length === 0 ? (
          // Dropzone
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload your homework</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Drag and drop your photos here, or tap to browse from your gallery.
            </p>
            <Button type="button" variant="outline">Select Images</Button>
          </div>
        ) : (
          // Preview Area
          <div>
            <div className="flex justify-between items-end mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">Selected Pages</h3>
                <p className="text-sm text-muted-foreground">{selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'} ready</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Add More
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative group aspect-[3/4] border rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`Preview ${idx+1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                      className="bg-destructive text-destructive-foreground p-2 rounded-full hover:scale-110 transition-transform"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              className="w-full h-12 text-lg font-semibold" 
              onClick={handleSubmit} 
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <UploadCloud className="w-5 h-5 mr-2" />}
              {isUploading ? 'Uploading...' : 'Submit Homework'}
            </Button>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        multiple 
        accept="image/jpeg, image/png, image/jpg" 
      />
    </div>
  );
}
