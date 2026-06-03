"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserSession {
  id: string;
  email: string;
  role: "STUDENT" | "PARENT" | "TEACHER" | "ADMIN";
  name: string;
  avatar?: string;
  studentId?: string;
  teacherId?: string;
  parentId?: string;
  class?: string;
  section?: string;
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if session exists in localStorage
    const savedUser = localStorage.getItem("dps_session");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("dps_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const sessionUser: UserSession = data.user;
        setUser(sessionUser);
        localStorage.setItem("dps_session", JSON.stringify(sessionUser));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || "Invalid credentials" };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "An error occurred during login. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dps_session");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
