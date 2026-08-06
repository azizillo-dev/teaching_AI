"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { TOKEN_KEY } from "@/constants";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refresh: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        try {
          const res = await api.get("/users/me/");
          setUser(res.data);
        } catch (error) {
          localStorage.removeItem(TOKEN_KEY);
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const login = (token: string, refresh: string) => {
    // implementation
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
