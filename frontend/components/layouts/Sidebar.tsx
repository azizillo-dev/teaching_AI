import Link from "next/link";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b font-bold text-2xl tracking-tight">
        Mentor AI
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </Link>
        <Link href="/groups" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
          <Users size={20} /> Groups
        </Link>
        <Link href="/assignments" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors">
          <BookOpen size={20} /> Assignments
        </Link>
      </nav>
    </aside>
  );
}
