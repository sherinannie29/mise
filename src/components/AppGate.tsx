"use client";

import { useAuthStore } from "@/lib/auth";
import { GuestPage } from "./GuestPage";

export function AppGate({ children, nav }: { children: React.ReactNode; nav: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#2d6a4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <GuestPage />;
  }

  return (
    <>
      {nav}
      <main className="min-h-screen">{children}</main>
    </>
  );
}
