"use client";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isTeacher = user?.role === "teacher";
  const isLocked = isTeacher && user?.is_trial_active === false;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-background border rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Obuna muddati tugadi</h2>
          <p className="text-muted-foreground mb-8">
            Sizning 14 kunlik bepul sinov muddatiningiz o'z nihoyasiga yetdi. Guruhlarga kirish va o'quvchilarga vazifalar berish uchun obunani xarid qiling.
          </p>
          <Link href="/pricing" className="block w-full">
            <Button className="w-full h-12 text-lg">
              Tariflarni ko'rish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
