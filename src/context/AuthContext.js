"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(undefined);

// Global Fetch Interceptor for JWT and Absolute API Paths
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = typeof input === "string" ? input : input.url || input.toString();

    if (url.startsWith("/api/")) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      url = `${apiBase}${url}`;

      const token = localStorage.getItem("dps_token");
      const headers = new Headers(init?.headers || {});
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      if (!headers.has("Content-Type") && !(init?.body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      return originalFetch(url, {
        ...init,
        headers,
      });
    }

    return originalFetch(input, init);
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
        localStorage.removeItem("dps_token");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password, captchaId, captchaAnswer) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaId, captchaAnswer }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.otpRequired) {
          setIsLoading(false);
          return { success: true, otpRequired: true, email: data.email };
        }
        const sessionUser = data.user;
        setUser(sessionUser);
        localStorage.setItem("dps_session", JSON.stringify(sessionUser));
        localStorage.setItem("dps_token", data.token); // Save JWT Token
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || data.detail || "Invalid credentials" };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "An error occurred during login. Please try again." };
    }
  };

  const loginWithGoogle = async (googleCredential, captchaId, captchaAnswer) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleCredential, captchaId, captchaAnswer }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.otpRequired) {
          setIsLoading(false);
          return { success: true, otpRequired: true, email: data.email };
        }
        if (data.requiresRoleSelection) {
          // Save temp details to session storage
          sessionStorage.setItem(
            "dps_temp_google_auth",
            JSON.stringify({
              email: data.email,
              name: data.name,
              avatar: data.avatar,
              googleId: data.googleId,
            })
          );
          setIsLoading(false);
          router.push("/register-role");
          return { success: true, requiresRole: true };
        } else {
          // User exists, login directly
          const sessionUser = data.user;
          setUser(sessionUser);
          localStorage.setItem("dps_session", JSON.stringify(sessionUser));
          localStorage.setItem("dps_token", data.token);
          setIsLoading(false);
          return { success: true, requiresRole: false };
        }
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || data.detail || "Google Sign-In failed" };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "An error occurred connecting to Google Auth" };
    }
  };

  const verifyOtp = async (email, otp) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const sessionUser = data.user;
        setUser(sessionUser);
        localStorage.setItem("dps_session", JSON.stringify(sessionUser));
        localStorage.setItem("dps_token", data.token);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.error || data.detail || "Invalid OTP code" };
      }
    } catch (err) {
      setIsLoading(false);
      return { success: false, error: "An error occurred verifying OTP. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("dps_session");
    localStorage.removeItem("dps_token");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithGoogle, verifyOtp, logout }}>
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
