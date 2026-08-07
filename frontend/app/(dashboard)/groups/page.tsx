"use client";

import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { useGroups } from "@/features/groups/hooks";
import { GroupCard } from "@/features/groups/components/GroupCard";
import { CreateGroupDialog, EditGroupDialog, DeleteGroupDialog } from "@/features/groups/components/GroupDialogs";
import { CreateStudentDialog } from "@/features/students/components/StudentDialogs";
import { Button } from "@/components/ui/button";
import { Group } from "@/features/groups/schema";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function GroupsPage() {
  const { data: groups, isLoading, isError, refetch } = useGroups();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStudentGroup, setCreateStudentGroup] = useState<string | null>(null);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);

  const handleCreateGroup = () => {
    if (groups && groups.length >= 3) {
      alert("Free tarifida eng ko'pi bilan 3 ta guruh yaratish mumkin. Iltimos, limitni oshirish uchun obunani xarid qiling.");
      return;
    }
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-muted rounded animate-pulse hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <ErrorState message="Failed to load groups. Please try again." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">All Groups</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your classes and students</p>
        </div>
        <Button onClick={handleCreateGroup} className="hidden md:flex shadow-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      {groups?.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Create your first group to start assigning homework."
          actionLabel="Create Group"
          onAction={handleCreateGroup}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups?.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={(g) => setEditGroup(g)}
              onDelete={(g) => setDeleteGroup(g)}
              onAddStudent={(g) => setCreateStudentGroup(g.id)}
              onClick={(g) => {
                // Navigate to group details in the future
                console.log("Navigating to group", g.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button
        onClick={handleCreateGroup}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-transform z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        aria-label="Create New Group"
      >
        <Plus className="w-6 h-6" />
      </button>

      <CreateGroupDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditGroupDialog isOpen={!!editGroup} onClose={() => setEditGroup(null)} group={editGroup} />
      <DeleteGroupDialog isOpen={!!deleteGroup} onClose={() => setDeleteGroup(null)} group={deleteGroup} />
      <CreateStudentDialog isOpen={!!createStudentGroup} onClose={() => setCreateStudentGroup(null)} initialGroupId={createStudentGroup} />
    </div>
  );
}
