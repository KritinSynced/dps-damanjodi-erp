"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AndroidRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAndroidApp = (window.Capacitor && (window.Capacitor.platform === "android" || window.Capacitor.getPlatform() === "android")) ||
        window.location.search.includes("platform=android");
        
      if (isAndroidApp) {
        router.push("/sign-in?platform=android");
      }
    }
  }, [router]);

  return null;
}
