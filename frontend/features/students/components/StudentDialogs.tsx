import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { studentCreateSchema, studentUpdateSchema, type StudentCreateFormData, type StudentUpdateFormData, type Student, type StudentCreateResponse } from "@/features/students/schema";
import { useCreateStudent, useUpdateStudent, useDeleteStudent } from "@/features/students/hooks";
import { useGroups } from "@/features/groups/hooks";
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
      <div className="w-full max-w-md bg-background border rounded-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[85vh]">
        <h2 className="text-lg font-bold tracking-tight mb-5">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function CreateStudentDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: groups } = useGroups();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentCreateFormData>({
    resolver: zodResolver(studentCreateSchema),
  });
  const createMutation = useCreateStudent();
  const [successData, setSuccessData] = useState<StudentCreateResponse | null>(null);

  useEffect(() => { 
    if (!isOpen) {
      reset();
      const timer = setTimeout(() => setSuccessData(null), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, reset]);

  const onSubmit = (data: StudentCreateFormData) => {
    createMutation.mutate(data, {
      onSuccess: (response) => {
        setSuccessData(response);
      },
    });
  };

  const copyCredentials = async () => {
    if (!successData) return;
    const text = `Username: ${successData.email}\nPassword: ${successData.password}`;
    await navigator.clipboard.writeText(text);
    // Could add toast here
  };

  if (successData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Student Created!">
        <div className="space-y-6">
          <div className="bg-primary/5 text-primary p-4 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-primary" />
            <div>
              <p className="font-semibold mb-2">Please copy these credentials now!</p>
              <div className="space-y-1 font-mono text-sm bg-background p-3 rounded border">
                <p><strong>Username:</strong> {successData.email}</p>
                <p><strong>Password:</strong> {successData.password}</p>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button type="button" variant="outline" onClick={copyCredentials}>
              <Copy className="w-4 h-4 mr-2" /> Copy Credentials
            </Button>
            <Button type="button" onClick={onClose}>Done</Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input placeholder="John" {...register("first_name")} className={errors.first_name ? "border-destructive" : ""} />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input placeholder="Doe" {...register("last_name")} className={errors.last_name ? "border-destructive" : ""} />
            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Group (Optional)</label>
          <select 
            {...register("group_id")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No Group</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Student
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditStudentDialog({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<StudentUpdateFormData>({
    resolver: zodResolver(studentUpdateSchema),
  });
  const updateMutation = useUpdateStudent();

  useEffect(() => {
    if (student && isOpen) {
      reset({ first_name: student.first_name, last_name: student.last_name });
    }
  }, [student, isOpen, reset]);

  const onSubmit = (data: StudentUpdateFormData) => {
    if (!student) return;
    updateMutation.mutate({ id: student.profile_id, data }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First Name</label>
            <Input placeholder="John" {...register("first_name")} className={errors.first_name ? "border-destructive" : ""} />
            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last Name</label>
            <Input placeholder="Doe" {...register("last_name")} className={errors.last_name ? "border-destructive" : ""} />
            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function DeactivateStudentDialog({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
  const updateMutation = useUpdateStudent();

  const onDeactivate = () => {
    if (!student) return;
    updateMutation.mutate({ id: student.profile_id, data: { is_active: false } }, {
      onSuccess: () => onClose(),
    });
  };

  const onActivate = () => {
    if (!student) return;
    updateMutation.mutate({ id: student.profile_id, data: { is_active: true } }, {
      onSuccess: () => onClose(),
    });
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student.is_active ? "Deactivate Student" : "Activate Student"}>
      <div className="space-y-4">
        <div className={`p-4 rounded-lg flex items-start gap-3 ${student.is_active ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-1">Are you sure?</p>
            {student.is_active ? (
               <p>Deactivating <strong>{student.first_name} {student.last_name}</strong> will prevent them from logging in and accessing their assignments. You can reactivate them later.</p>
            ) : (
               <p>Activating <strong>{student.first_name} {student.last_name}</strong> will restore their access to the platform.</p>
            )}
          </div>
        </div>
        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
          <Button type="button" variant={student.is_active ? "destructive" : "default"} onClick={student.is_active ? onDeactivate : onActivate} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {student.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function DeleteStudentDialog({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
  const deleteMutation = useDeleteStudent();

  const onDelete = () => {
    if (!student) return;
    deleteMutation.mutate(student.profile_id, {
      onSuccess: () => onClose(),
    });
  };

  if (!student) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Talabani o'chirish">
      <div className="space-y-4">
        <p className="text-sm text-foreground">
          Bu amal <strong>{student.first_name} {student.last_name}</strong>ning barcha ma'lumotlarini o'chiradi. Rozimisiz?
        </p>
        <div className="pt-4 flex items-center justify-end gap-3 mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleteMutation.isPending}>Bekor qilish</Button>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Ha
          </Button>
        </div>
      </div>
    </Modal>
  );
}
