"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-background sticky top-0 z-10">
      <h1 className="text-xl font-bold md:hidden">Mentor AI</h1>
      <div className="flex-1" />
      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-2 rounded-full hover:bg-accent"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </button>
    </header>
  );
}
