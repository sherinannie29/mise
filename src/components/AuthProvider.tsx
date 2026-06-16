"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, []);
  return <>{children}</>;
}
