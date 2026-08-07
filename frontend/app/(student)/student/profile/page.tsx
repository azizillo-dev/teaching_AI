"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";

export default function StudentProfilePage() {
  const { user, logout } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>
      <div className="bg-card border rounded-xl p-6 mb-8">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium text-lg">{user?.first_name} {user?.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="font-medium font-mono break-all">{user?.email}</p>
          </div>
        </div>
      </div>
      <Button variant="destructive" className="w-full md:w-auto" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
}
