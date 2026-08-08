import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { assignmentCreateSchema, assignmentUpdateSchema, type AssignmentCreateFormData, type AssignmentUpdateFormData, type Assignment } from "@/features/assignments/schema";
import { useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from "@/features/assignments/hooks";
import { useGroups } from "@/features/groups/hooks";
import { useBooks } from "@/features/library/hooks";
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

export function CreateAssignmentDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: groups } = useGroups();
  const { data: books } = useBooks();
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<AssignmentCreateFormData>({
    resolver: zodResolver(assignmentCreateSchema),
    defaultValues: {
      description: ""
    }
  });
  const createMutation = useCreateAssignment();

  useEffect(() => { 
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const selectedBook = watch("book");

  const onSubmit = (data: AssignmentCreateFormData) => {
    const payloadFields: any = {
      group: data.group,
      title: data.title,
      description: data.description,
      book: data.book || undefined,
      page_start: data.page_start || undefined,
      page_end: data.page_end || undefined,
      deadline: data.deadline || undefined,
    };

    let payload: any = payloadFields;

    if (data.image && data.image.length > 0) {
      const formData = new FormData();
      Object.keys(payloadFields).forEach(key => {
        if (payloadFields[key] !== undefined) {
          formData.append(key, payloadFields[key]);
        }
      });
      formData.append('image', data.image[0]);
      payload = formData;
    }

    createMutation.mutate(payload, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vazifa yaratish">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Guruh</label>
          <select 
            {...register("group")}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.group ? "border-destructive" : ""}`}
          >
            <option value="">Guruhni tanlang...</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {errors.group && <p className="text-xs text-destructive">{errors.group.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Sarlavha</label>
          <Input placeholder="Masalan: Matematika uy ishi 4" {...register("title")} className={errors.title ? "border-destructive" : ""} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tugash muddati (Deadline) (Ixtiyoriy)</label>
          <Input type="datetime-local" {...register("deadline")} className={errors.deadline ? "border-destructive" : ""} />
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Rasm orqali vazifa (Ixtiyoriy)</label>
          <Input type="file" accept="image/*" {...register("image")} className={errors.image ? "border-destructive" : ""} />
          {errors.image && <p className="text-xs text-destructive">{errors.image.message as string}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Kitobdan tanlash (Ixtiyoriy)</label>
          <select 
            {...register("book")}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.book ? "border-destructive" : ""}`}
          >
            <option value="">Kitob tanlanmagan</option>
            {books?.map((b) => (
              <option key={b.id} value={b.id}>{b.title} {b.total_pages ? `(${b.total_pages} bet)` : ""}</option>
            ))}
          </select>
        </div>

        {selectedBook && (
          <div className="flex gap-3">
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium">Boshlanish beti</label>
              <Input type="number" min="1" {...register("page_start")} className={errors.page_start ? "border-destructive" : ""} />
              {errors.page_start && <p className="text-xs text-destructive">{errors.page_start.message}</p>}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="text-sm font-medium">Tugash beti</label>
              <Input type="number" min="1" {...register("page_end")} className={errors.page_end ? "border-destructive" : ""} />
              {errors.page_end && <p className="text-xs text-destructive">{errors.page_end.message}</p>}
            </div>
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tavsif (Qo'llanma)</label>
          <textarea 
            placeholder="O'quvchilar uchun ko'rsatmalar yoki vazifa matni..." 
            {...register("description")} 
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? "border-destructive" : ""}`}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="pt-3 flex gap-3 border-t mt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={createMutation.isPending}>Bekor qilish</Button>
          <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            E'lon qilish
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditAssignmentDialog({ isOpen, onClose, assignment }: { isOpen: boolean; onClose: () => void; assignment: Assignment | null }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentUpdateFormData>({
    resolver: zodResolver(assignmentUpdateSchema),
  });
  const updateMutation = useUpdateAssignment();

  useEffect(() => {
    if (assignment && isOpen) {
      reset({ 
        title: assignment.title, 
        description: assignment.description,
      });
    }
  }, [assignment, isOpen, reset]);

  const onSubmit = (data: AssignmentUpdateFormData) => {
    if (!assignment) return;
    updateMutation.mutate({ id: assignment.id, data }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vazifani tahrirlash">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Sarlavha</label>
          <Input placeholder="Masalan: Matematika uy ishi 4" {...register("title")} className={errors.title ? "border-destructive" : ""} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Tavsif (Qo'llanma)</label>
          <textarea 
            placeholder="O'quvchilar uchun ko'rsatmalar..." 
            {...register("description")} 
            className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? "border-destructive" : ""}`}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="pt-3 flex gap-3 border-t mt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={updateMutation.isPending}>Bekor qilish</Button>
          <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function DeleteAssignmentDialog({ isOpen, onClose, assignment }: { isOpen: boolean; onClose: () => void; assignment: Assignment | null }) {
  const deleteMutation = useDeleteAssignment();

  const onDelete = () => {
    if (!assignment) return;
    deleteMutation.mutate(assignment.id, {
      onSuccess: () => onClose(),
    });
  };

  if (!assignment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vazifani o'chirish">
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Siz haqiqatan ham ushbu vazifani o'chirib yubormoqchimisiz? Rozimisiz?
        </p>
        <div className="pt-4 flex gap-3 mt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={deleteMutation.isPending}>Bekor qilish</Button>
          <Button type="button" variant="destructive" className="flex-1" onClick={onDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ha
          </Button>
        </div>
      </div>
    </Modal>
  );
}
