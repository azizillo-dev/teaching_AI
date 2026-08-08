"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, GraduationCap, BarChart3, Library } from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { name: "Home", href: user?.role === "student" ? "/student" : "/", icon: LayoutDashboard },
    { name: "Groups", href: "/groups", icon: Users },
    { name: "Students", href: "/students", icon: GraduationCap },
    { name: "Tasks", href: "/assignments", icon: BookOpen },
    { name: "Library", href: "/library", icon: Library },
    { name: "Analytics", href: "/results", icon: BarChart3 },
  ].filter(item => {
    // If student, hide Groups and Students
    if (user?.role === "student" && (item.name === "Groups" || item.name === "Students")) {
      return false;
    }
    return true;
  });

  return (
    <nav className="md:hidden fixed bottom-0 w-full border-t bg-background flex items-center justify-around h-16 z-50 pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full p-1 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <item.icon size={22} className={isActive ? 'stroke-[2.5px]' : ''} />
            <span className="text-[10px] mt-1 font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
