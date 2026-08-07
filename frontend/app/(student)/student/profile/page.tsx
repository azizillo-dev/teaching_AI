"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      <div className="bg-card border rounded-xl overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 border-b hover:bg-muted/30 transition-colors">
          <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</span>
          </div>
          <div className="w-full sm:w-2/3">
            <p className="text-sm font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-muted/30 transition-colors">
          <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</span>
          </div>
          <div className="w-full sm:w-2/3 min-w-0">
            <p className="text-sm font-medium text-foreground font-mono truncate">{user?.email}</p>
          </div>
        </div>
      </div>
      <Button variant="destructive" className="w-full md:w-auto" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
}
