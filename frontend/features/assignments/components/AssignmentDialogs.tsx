import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { assignmentCreateSchema, assignmentUpdateSchema, type AssignmentCreateFormData, type AssignmentUpdateFormData, type Assignment } from "@/features/assignments/schema";
import { useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from "@/features/assignments/hooks";
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-background md:rounded-xl rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function CreateAssignmentDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { data: groups } = useGroups();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssignmentCreateFormData>({
    resolver: zodResolver(assignmentCreateSchema),
  });
  const createMutation = useCreateAssignment();

  useEffect(() => { 
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: AssignmentCreateFormData) => {
    // Backend expects ISO string but datetime-local gives "YYYY-MM-DDThh:mm"
    // We convert it to standard ISO string if necessary. Actually the browser string is close enough, 
    // but better to create a new Date and convert to toISOString().
    const formattedData = {
      ...data,
      deadline: new Date(data.deadline).toISOString()
    };
    createMutation.mutate(formattedData, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Assignment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Group</label>
          <select 
            {...register("group")}
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.group ? "border-destructive" : ""}`}
          >
            <option value="">Select a group...</option>
            {groups?.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          {errors.group && <p className="text-xs text-destructive">{errors.group.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input placeholder="E.g., Math Homework 4" {...register("title")} className={errors.title ? "border-destructive" : ""} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea 
            placeholder="Instructions for students..." 
            {...register("description")} 
            className={`flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? "border-destructive" : ""}`}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline</label>
          <Input type="datetime-local" {...register("deadline")} className={errors.deadline ? "border-destructive" : ""} />
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publish Assignment
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
      // slice(0, 16) formats ISO "2024-12-31T23:59:00Z" to "2024-12-31T23:59" for datetime-local
      reset({ 
        title: assignment.title, 
        description: assignment.description,
        deadline: new Date(assignment.deadline).toISOString().slice(0, 16) 
      });
    }
  }, [assignment, isOpen, reset]);

  const onSubmit = (data: AssignmentUpdateFormData) => {
    if (!assignment) return;
    const formattedData = {
      ...data,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined
    };
    updateMutation.mutate({ id: assignment.id, data: formattedData }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input placeholder="E.g., Math Homework 4" {...register("title")} className={errors.title ? "border-destructive" : ""} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea 
            placeholder="Instructions for students..." 
            {...register("description")} 
            className={`flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${errors.description ? "border-destructive" : ""}`}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline</label>
          <Input type="datetime-local" {...register("deadline")} className={errors.deadline ? "border-destructive" : ""} />
          {errors.deadline && <p className="text-xs text-destructive">{errors.deadline.message}</p>}
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
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Assignment">
      <div className="space-y-4">
        <div className="p-4 rounded-lg flex items-start gap-3 bg-destructive/10 text-destructive">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-1">Are you completely sure?</p>
            <p>Deleting <strong>{assignment.title}</strong> will permanently remove it along with all student submissions. This action cannot be undone.</p>
          </div>
        </div>
        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleteMutation.isPending}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
