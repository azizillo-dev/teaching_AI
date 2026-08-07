import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Users, FileText, Activity } from "lucide-react";
import { Group } from "@/features/groups/schema";
import { Button } from "@/components/ui/button";

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onClick: (group: Group) => void;
  onAddStudent: (group: Group) => void;
}

export function GroupCard({ group, onEdit, onDelete, onClick, onAddStudent }: GroupCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  return (
    <div
      onClick={() => onClick(group)}
      className="group relative flex flex-col justify-between bg-card hover:bg-accent/30 border border-border rounded-lg p-5 shadow-sm cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{group.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Created {new Date(group.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-lg rounded-md z-10 py-1 text-sm font-medium animate-in fade-in zoom-in-95">
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted"
                onClick={(e) => handleAction(e, () => onAddStudent(group))}
              >
                Add Student
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-muted"
                onClick={(e) => handleAction(e, () => onEdit(group))}
              >
                Edit Group
              </button>
              <button
                className="w-full text-left px-4 py-2 text-destructive hover:bg-destructive/10"
                onClick={(e) => handleAction(e, () => onDelete(group))}
              >
                Delete Group
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Users className="w-3 h-3" /> Students
          </span>
          <span className="font-medium">{group.student_count}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <FileText className="w-3 h-3" /> Tasks
          </span>
          <span className="font-medium">{group.assignment_count}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3" /> Score
          </span>
          <span className="font-medium">{Number(group.average_score || 0).toFixed(1)}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t flex gap-2">
         <Button variant="outline" size="sm" className="w-full text-xs font-medium" onClick={(e) => { e.stopPropagation(); onAddStudent(group); }}>
            + Add Student
         </Button>
      </div>
    </div>
  );
}
