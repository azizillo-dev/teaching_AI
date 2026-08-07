"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-0 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t flex justify-around items-center h-16 px-4 z-50">
        <Link href="/student" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/student' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`}>
          <Home className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/student/assignments" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/student/assignments' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`}>
          <BookOpen className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Assignments</span>
        </Link>
        <Link href="/student/profile" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/student/profile' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition-colors`}>
          <User className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 bottom-0 w-64 bg-card border-r flex-col z-50">
         <div className="p-6 border-b">
           <h1 className="text-xl font-bold font-mono">Mentor<span className="text-primary">AI</span></h1>
         </div>
         <nav className="p-4 space-y-2">
            <Link href="/student" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/student' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
              <Home className="w-5 h-5" /> Home
            </Link>
            <Link href="/student/assignments" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/student/assignments' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
              <BookOpen className="w-5 h-5" /> Assignments
            </Link>
            <Link href="/student/profile" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/student/profile' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
              <User className="w-5 h-5" /> Profile
            </Link>
         </nav>
      </div>

      {/* Desktop Margin Offset */}
      <div className="hidden md:block w-64 shrink-0" />
    </div>
  );
}
