"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DPSLogo from "@/components/ui/DPSLogo";
import Link from "next/link";
import { AlertCircle, ArrowLeft, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.push("/login");
  }, [router]);

  return null;
}
