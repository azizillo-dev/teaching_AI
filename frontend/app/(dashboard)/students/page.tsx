"use client";

import { useState, useMemo } from "react";
import { Plus, Users, Search, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useStudents } from "@/features/students/hooks";
import { useGroups } from "@/features/groups/hooks";
import { AddStudentDialog, EditStudentDialog, DeactivateStudentDialog } from "@/features/students/components/StudentDialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/features/students/schema";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function StudentsPage() {
  const { data: students, isLoading, isError, refetch } = useStudents();
  const { data: groups } = useGroups();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deactivateStudent, setDeactivateStudent] = useState<Student | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student => {
      const matchesSearch = 
        student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesGroup = groupFilter ? student.group_name === groups?.find(g => g.id === groupFilter)?.name : true;
      const matchesStatus = statusFilter ? (statusFilter === "active" ? student.is_active : !student.is_active) : true;
      
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [students, searchQuery, groupFilter, statusFilter, groups]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-64 bg-muted rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <ErrorState message="Failed to load students. Please try again." onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-8 h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">Manage your students</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="hidden md:flex">
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {students?.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students yet"
          description="Add your first student to start tracking their progress."
          actionLabel="Add Student"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name or email..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">All Groups</option>
                {groups?.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-xl bg-card overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Student</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Username</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Group</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Avg Score</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <span className="font-medium">{student.first_name} {student.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4">{student.group_name || <span className="text-muted-foreground italic">No group</span>}</td>
                    <td className="px-6 py-4 font-medium">{(student.average_score || 0).toFixed(1)}</td>
                    <td className="px-6 py-4">
                      {student.is_active ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end relative group/menu">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {/* CSS-only dropdown for simplicity and robustness */}
                        <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-lg rounded-md z-10 py-1 text-sm font-medium opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                          <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => setEditStudent(student)}>Edit</button>
                          <button className="w-full text-left px-4 py-2 hover:bg-muted text-destructive" onClick={() => setDeactivateStudent(student)}>
                            {student.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No students found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredStudents.map(student => (
              <div key={student.id} className="bg-card border rounded-xl p-4 flex flex-col gap-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm uppercase shrink-0">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold leading-tight">{student.first_name} {student.last_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{student.email}</p>
                    </div>
                  </div>
                  <div className="relative group/menu">
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-lg rounded-md z-10 py-1 text-sm font-medium opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all">
                      <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => setEditStudent(student)}>Edit</button>
                      <button className="w-full text-left px-4 py-2 hover:bg-muted text-destructive" onClick={() => setDeactivateStudent(student)}>
                        {student.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm pt-3 border-t">
                  <div>
                    <p className="text-muted-foreground text-xs">Group</p>
                    <p className="font-medium line-clamp-1">{student.group_name || "None"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Avg Score</p>
                    <p className="font-medium">{(student.average_score || 0).toFixed(1)}</p>
                  </div>
                  <div className="col-span-2 flex items-center mt-1">
                    {student.is_active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-muted-foreground border rounded-xl">
                No students found matching your filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-transform z-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        aria-label="Add Student"
      >
        <Plus className="w-6 h-6" />
      </button>

      <AddStudentDialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditStudentDialog isOpen={!!editStudent} onClose={() => setEditStudent(null)} student={editStudent} />
      <DeactivateStudentDialog isOpen={!!deactivateStudent} onClose={() => setDeactivateStudent(null)} student={deactivateStudent} />
    </div>
  );
}
