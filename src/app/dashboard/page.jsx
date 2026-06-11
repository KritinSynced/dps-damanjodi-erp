"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const { user, isLoading } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && clerkLoaded) {
      if (user) {
        router.replace(`/portal/${user.role.toLowerCase()}`);
      } else if (clerkUser) {
        router.replace("/register-role");
      } else {
        router.replace("/login");
      }
    }
  }, [user, clerkUser, clerkLoaded, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Redirecting to Portal...</p>
    </div>
  );
}
