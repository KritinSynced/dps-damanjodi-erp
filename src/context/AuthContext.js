"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext(undefined);

// Global Fetch Interceptor for JWT and Absolute API Paths
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async function (input, init) {
    let url = typeof input === "string" ? input : input.url || input.toString();

    const isRelativeApi = url.startsWith("/api/");
    const isAbsoluteApi = url.startsWith(window.location.origin + "/api/");

    if (isRelativeApi || isAbsoluteApi) {
      let apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      if (apiBase.includes("your-backend-service-url")) {
        apiBase = "http://localhost:5000";
      }

      let targetUrl = url;
      if (isRelativeApi) {
        targetUrl = `${apiBase}${url}`;
      } else {
        try {
          const parsedUrl = new URL(url);
          targetUrl = `${apiBase}${parsedUrl.pathname}${parsedUrl.search}`;
        } catch (e) {
          targetUrl = url.replace(window.location.origin, apiBase);
        }
      }

      const token = localStorage.getItem("dps_token");
      const isFormData = init?.body instanceof FormData || (typeof input === "object" && input instanceof Request && input.body instanceof FormData);

      let newRequest;
      if (typeof input === "object" && input instanceof Request) {
        const mergedHeaders = new Headers(input.headers);
        if (init?.headers) {
          const initHeaders = new Headers(init.headers);
          for (const [k, v] of initHeaders.entries()) {
            mergedHeaders.set(k, v);
          }
        }
        if (token) {
          mergedHeaders.set("Authorization", `Bearer ${token}`);
        }
        if (!mergedHeaders.has("Content-Type") && !isFormData) {
          mergedHeaders.set("Content-Type", "application/json");
        }

        const options = {
          ...init,
          headers: mergedHeaders,
        };
        newRequest = new Request(targetUrl, options);
      } else {
        const mergedHeaders = new Headers(init?.headers || {});
        if (token) {
          mergedHeaders.set("Authorization", `Bearer ${token}`);
        }
        if (!mergedHeaders.has("Content-Type") && !isFormData) {
          mergedHeaders.set("Content-Type", "application/json");
        }
        newRequest = new Request(targetUrl, {
          ...init,
          headers: mergedHeaders,
        });
      }

      try {
        return await originalFetch(newRequest);
      } catch (err) {
        console.error("Fetch interceptor failed for URL:", targetUrl, err);
        throw err;
      }
    }

    return originalFetch(input, init);
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const router = useRouter();

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("dps_token");
      if (token) {
        try {
          const res = await fetch("/api/auth/me");
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUser(data.user);
              localStorage.setItem("dps_session", JSON.stringify(data.user));
            } else {
              localStorage.removeItem("dps_session");
              localStorage.removeItem("dps_token");
              document.cookie = "dps_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
              setUser(null);
            }
          } else {
            localStorage.removeItem("dps_session");
            localStorage.removeItem("dps_token");
            document.cookie = "dps_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
            setUser(null);
          }
        } catch (e) {
          console.error("Failed to restore session via /api/auth/me, using local fallback", e);
          const stored = localStorage.getItem("dps_session");
          if (stored) {
            try {
              setUser(JSON.parse(stored));
            } catch (err) {}
          }
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  // Save login session details
  const saveSession = useCallback((sessionUser, token) => {
    setUser(sessionUser);
    localStorage.setItem("dps_session", JSON.stringify(sessionUser));
    localStorage.setItem("dps_token", token);
    document.cookie = "dps_token=" + token + "; path=/; max-age=" + 7 * 24 * 60 * 60 + "; SameSite=Lax";
    setAuthError(null);
  }, []);

  // Logout action
  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem("dps_session");
    localStorage.removeItem("dps_token");
    document.cookie = "dps_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setAuthError(null);
    router.push("/sign-in");
  }, [router]);

  // Switch role action
  const switchRole = useCallback(async (newRole) => {
    try {
      const response = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRole }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        saveSession(data.user, data.token);
        router.push(`/portal/${newRole.toLowerCase()}`);
      } else {
        setAuthError(data.error || "Failed to switch role.");
      }
    } catch (err) {
      console.error("Error switching role:", err);
    }
  }, [saveSession, router]);

  // Session activity timer
  useEffect(() => {
    if (typeof window === "undefined" || !user) return;

    const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
    let timeoutId;
    let mouseMoveThrottle = null;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Session expired due to inactivity. Logging out.");
        logout();
      }, INACTIVITY_TIMEOUT);
    };

    const throttledMouseMove = () => {
      if (mouseMoveThrottle) return;
      mouseMoveThrottle = setTimeout(() => {
        mouseMoveThrottle = null;
        resetTimer();
      }, 1000);
    };

    const directEvents = ["mousedown", "keypress", "scroll", "touchstart"];
    directEvents.forEach((event) => window.addEventListener(event, resetTimer));
    window.addEventListener("mousemove", throttledMouseMove);

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (mouseMoveThrottle) clearTimeout(mouseMoveThrottle);
      directEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("mousemove", throttledMouseMove);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        authError,
        setAuthError,
        setUser,
        saveSession,
        switchRole,
      }}
    >
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