"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/constants";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  user_id: string;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  is_trial_active?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (token: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const parseUser = (token: string): User | null => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      return JSON.parse(atob(payload)) as User;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        setIsAuthenticated(true);
        setUser(parseUser(token));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [pathname]);

  const login = (token: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    setIsAuthenticated(true);
    setUser(parseUser(token));
    const role = parseUser(token)?.role;
    router.push(role === "student" ? "/student" : "/");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setIsAuthenticated(false);
    setUser(null);
    router.push("/login");
  };

  // Redirect logic
  useEffect(() => {
    const publicRoutes = ["/login", "/register", "/forgot-password", "/pricing"];
    const isPublicRoute = publicRoutes.includes(pathname);
    
    if (!isLoading) {
      if (!isPublicRoute && !user) {
        router.push("/login");
      } else if (isPublicRoute && user && pathname !== "/pricing") {
        router.push(user.role === "student" ? "/student" : "/");
      } else if (user) {
        const isStudentPortal = pathname === "/student" || pathname.startsWith("/student/");
        if (user.role === "student" && !isStudentPortal) {
          router.push("/student");
        } else if (user.role === "teacher" && isStudentPortal) {
          router.push("/");
        }
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
