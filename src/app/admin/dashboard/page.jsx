"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminDashboardRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/portal/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-primary w-10 h-10" />
      <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Redirecting to Admin Portal...</p>
    </div>
  );
}
