"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { UsersService } from "@/services/users.service";

export function Header() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => UsersService.getProfile(),
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Determine Page Title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const path = pathname.split('/')[1];
    return path ? path.charAt(0).toUpperCase() + path.slice(1) : "";
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-background sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 md:hidden">
          <img src="/logo.png?v=2" alt="Teacher AI" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-bold tracking-tight">Teacher AI</h1>
        </div>
        <h2 className="hidden md:block text-lg font-semibold tracking-tight">{getPageTitle()}</h2>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {/* Mock notification dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground border hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background overflow-hidden"
          >
            {profile?.avatar ? (
              <img src={profile.avatar.startsWith("http") || profile.avatar.startsWith("blob:") ? profile.avatar : `http://localhost:8000${profile.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b mb-1">
                <p className="text-sm font-medium truncate">{profile ? `${profile.first_name} ${profile.last_name}` : "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
              <a 
                href="/profile"
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Sozlamalar
              </a>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
