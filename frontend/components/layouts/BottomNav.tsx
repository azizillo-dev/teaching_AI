import Link from "next/link";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex items-center justify-around h-16 z-50 pb-safe">
      <Link href="/" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
        <LayoutDashboard size={24} />
        <span className="text-[10px] mt-1">Home</span>
      </Link>
      <Link href="/groups" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
        <Users size={24} />
        <span className="text-[10px] mt-1">Groups</span>
      </Link>
      <Link href="/assignments" className="flex flex-col items-center p-2 text-muted-foreground hover:text-foreground">
        <BookOpen size={24} />
        <span className="text-[10px] mt-1">Tasks</span>
      </Link>
    </nav>
  );
}
