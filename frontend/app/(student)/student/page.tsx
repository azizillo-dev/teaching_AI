"use client";

import { useAuth } from "@/providers/AuthProvider";

export default function StudentHomePage() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 md:ml-64 pt-8 text-center mt-20">
      <h1 className="text-2xl font-bold mb-4">Welcome back, {user?.first_name}!</h1>
      <p className="text-muted-foreground">Select &quot;Assignments&quot; from the menu to view your homework.</p>
    </div>
  );
}
