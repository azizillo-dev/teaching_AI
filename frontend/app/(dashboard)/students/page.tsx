"use client";

import { useState, useMemo } from "react";
import { Plus, Users, Search, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { useStudents } from "@/features/students/hooks";
import { useGroups } from "@/features/groups/hooks";
import { CreateStudentDialog, EditStudentDialog, DeactivateStudentDialog, DeleteStudentDialog } from "@/features/students/components/StudentDialogs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/features/students/schema";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";

export default function StudentsPage() {
  const { data: students, isLoading, isError, refetch } = useStudents();
  const { data: groups } = useGroups();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deactivateStudent, setDeactivateStudent] = useState<Student | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(student => {
      const matchesSearch = 
        (student.first_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.last_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (student.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">All Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track your students</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="w-full md:w-auto shadow-sm">
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
          onAction={() => setIsCreateOpen(true)}
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
            <div className="flex gap-3 w-full md:w-auto">
              <select 
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">All Groups</option>
                {groups?.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <select 
                className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <div className="hidden md:block border border-border rounded-lg bg-card shadow-sm overflow-hidden">
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
                          {student.first_name?.[0] || ""}{student.last_name?.[0] || ""}
                        </div>
                        <span className="font-medium">{student.first_name || "Unknown"} {student.last_name || ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-4">{student.group_name || <span className="text-muted-foreground italic">No group</span>}</td>
                    <td className="px-6 py-4 font-medium">{Number(student.average_score || 0).toFixed(1)}</td>
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
                      <div className="flex justify-end relative">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        
                        {openMenuId === student.id && (
                          <>
                            {/* Invisible overlay for desktop click-away */}
                            <div className="fixed inset-0 z-50" onClick={() => setOpenMenuId(null)}></div>
                            <div className="absolute right-0 top-full mt-1 w-40 bg-popover border shadow-lg rounded-md z-[60] py-1 text-sm font-medium animate-in fade-in zoom-in-95 duration-100">
                              <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { setEditStudent(student); setOpenMenuId(null); }}>Tahrirlash</button>
                              <button className="w-full text-left px-4 py-2 hover:bg-muted" onClick={() => { setDeactivateStudent(student); setOpenMenuId(null); }}>
                                {student.is_active ? "O'chirish (Vaqtinchalik)" : "Faollashtirish"}
                              </button>
                              <div className="border-t my-1"></div>
                              <button className="w-full text-left px-4 py-2 hover:bg-muted text-destructive" onClick={() => { setDeleteStudent(student); setOpenMenuId(null); }}>
                                O'chirib yuborish
                              </button>
                            </div>
                          </>
                        )}
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

          {/* Mobile List View */}
          <div className="md:hidden border border-border rounded-lg bg-card shadow-sm overflow-hidden divide-y divide-border">
            {filteredStudents.map(student => (
              <div key={student.id} className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors w-full">
                <div className="flex-1 flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {student.first_name?.[0] || ""}{student.last_name?.[0] || ""}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-foreground truncate">{student.first_name || "Unknown"} {student.last_name || ""}</span>
                      {student.is_active ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="truncate max-w-[100px] font-medium bg-muted px-1.5 py-0.5 rounded">{student.group_name || "No group"}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">Avg: {Number(student.average_score || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 -mr-2"
                    onClick={() => setOpenMenuId(openMenuId === student.id ? null : student.id)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  
                  {openMenuId === student.id && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                      {/* Invisible backdrop to click away */}
                      <div className="absolute inset-0" onClick={() => setOpenMenuId(null)}></div>
                      
                      {/* Centered menu */}
                      <div className="relative w-full max-w-xs bg-background border shadow-2xl rounded-xl py-2 text-base font-medium animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 text-sm text-muted-foreground border-b mb-1 font-semibold text-center">
                          {student.first_name} {student.last_name}
                        </div>
                        <button className="w-full text-center px-4 py-3 hover:bg-muted active:bg-muted" onClick={() => { setEditStudent(student); setOpenMenuId(null); }}>Tahrirlash</button>
                        <button className="w-full text-center px-4 py-3 hover:bg-muted active:bg-muted" onClick={() => { setDeactivateStudent(student); setOpenMenuId(null); }}>
                          {student.is_active ? "O'chirish (Vaqtinchalik)" : "Faollashtirish"}
                        </button>
                        <div className="border-t my-1"></div>
                        <button className="w-full text-center px-4 py-3 hover:bg-muted active:bg-muted text-destructive" onClick={() => { setDeleteStudent(student); setOpenMenuId(null); }}>
                          O'chirib yuborish
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredStudents.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                No students found matching your filters.
              </div>
            )}
          </div>
        </div>
      )}

      <CreateStudentDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditStudentDialog isOpen={!!editStudent} onClose={() => setEditStudent(null)} student={editStudent} />
      <DeactivateStudentDialog isOpen={!!deactivateStudent} onClose={() => setDeactivateStudent(null)} student={deactivateStudent} />
      <DeleteStudentDialog isOpen={!!deleteStudent} onClose={() => setDeleteStudent(null)} student={deleteStudent} />
    </div>
  );
}
