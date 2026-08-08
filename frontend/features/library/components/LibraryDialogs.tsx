import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { bookUploadSchema, type BookUploadFormData } from "@/features/library/schema";
import { useUploadBook } from "@/features/library/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 duration-200 p-4">
      <div className="w-full max-w-md bg-background border rounded-lg p-5 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <h2 className="text-lg font-bold tracking-tight mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function UploadBookDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BookUploadFormData>({
    resolver: zodResolver(bookUploadSchema),
  });
  const uploadMutation = useUploadBook();

  useEffect(() => { 
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: BookUploadFormData) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.subject) formData.append("subject", data.subject);
    const fileList = data.file as any;
    formData.append("file", fileList instanceof File ? fileList : fileList[0]);

    uploadMutation.mutate(formData, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Kitob yuklash">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Sarlavha (Kitob nomi)</label>
          <Input placeholder="Masalan: Matematika 5-sinf" {...register("title")} className={errors.title ? "border-destructive" : ""} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fan nomi (Ixtiyoriy)</label>
          <Input placeholder="Masalan: Matematika" {...register("subject")} className={errors.subject ? "border-destructive" : ""} />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Fayl (PDF, DOCX, JPG va boshqalar)</label>
          <Input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" {...register("file")} className={errors.file ? "border-destructive" : ""} />
          {errors.file && <p className="text-xs text-destructive">{errors.file.message as string}</p>}
        </div>

        <div className="pt-3 flex gap-3 border-t mt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={uploadMutation.isPending}>Bekor qilish</Button>
          <Button type="submit" className="flex-1" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Yuklash
          </Button>
        </div>
      </form>
    </Modal>
  );
}
