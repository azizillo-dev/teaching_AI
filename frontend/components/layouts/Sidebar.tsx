"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, GraduationCap, BarChart3, Settings, LogOut, Library } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Students", href: "/students", icon: GraduationCap },
    { name: "Assignments", href: "/assignments", icon: BookOpen },
    { name: "Library", href: "/library", icon: Library },
    { name: "Results", href: "/results", icon: BarChart3 },
    { name: "Profile", href: "/profile", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b font-bold text-lg tracking-tight">
        Mentor AI
      </div>
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon size={18} /> {item.name}
            </Link>
          );
        })}
        <div className="mt-auto pt-4">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
