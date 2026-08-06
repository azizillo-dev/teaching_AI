import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, AlertCircle } from "lucide-react";
import { groupSchema, type GroupFormData, type Group } from "@/features/groups/schema";
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from "@/features/groups/hooks";
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

export function CreateGroupDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });
  const createMutation = useCreateGroup();

  useEffect(() => { if (!isOpen) reset(); }, [isOpen, reset]);

  const onSubmit = (data: GroupFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Group">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Group Name</label>
          <Input placeholder="e.g. Math 101" {...register("name")} className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Input placeholder="Brief details about the group" {...register("description")} />
        </div>
        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export function EditGroupDialog({ isOpen, onClose, group }: { isOpen: boolean; onClose: () => void; group: Group | null }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
  });
  const updateMutation = useUpdateGroup();

  useEffect(() => {
    if (group && isOpen) {
      reset({ name: group.name, description: group.description });
    }
  }, [group, isOpen, reset]);

  const onSubmit = (data: GroupFormData) => {
    if (!group) return;
    updateMutation.mutate({ id: group.id, data }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Group">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Group Name</label>
          <Input placeholder="e.g. Math 101" {...register("name")} className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Input placeholder="Brief details about the group" {...register("description")} />
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

export function DeleteGroupDialog({ isOpen, onClose, group }: { isOpen: boolean; onClose: () => void; group: Group | null }) {
  const deleteMutation = useDeleteGroup();

  const onDelete = () => {
    if (!group) return;
    deleteMutation.mutate(group.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Group">
      <div className="space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-semibold mb-1">Warning: Destructive Action</p>
            You are about to delete <strong>{group?.name}</strong>. This will permanently remove all students, assignments, and submissions inside this group. This cannot be undone.
          </div>
        </div>
        <div className="pt-4 flex items-center justify-end gap-3 border-t mt-6">
          <Button type="button" variant="ghost" onClick={onClose} disabled={deleteMutation.isPending}>Cancel</Button>
          <Button type="button" variant="destructive" onClick={onDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Group
          </Button>
        </div>
      </div>
    </Modal>
  );
}
