"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MiseLogo } from "./MiseLogo";
import { useAuthStore } from "@/lib/auth";
import { LogOut } from "lucide-react";

export function Nav() {
  const path = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const links = [
    { href: "/", label: "Recipes" },
    { href: "/recommendations", label: "For You" },
    { href: "/add", label: "+ Add" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f0e8] border-b border-[#e5e7eb]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <MiseLogo size="sm" />
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                path === l.href
                  ? "bg-[#2d6a4f] text-white"
                  : "text-[#6b7280] hover:text-[#0d0d0d] hover:bg-[#f3f4f6]"
              }`}
            >
              {l.label}
            </Link>
          ))}

          {user && (
            <div className="flex items-center gap-2 ml-2 pl-3 border-l border-[#e5e7eb]">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#2d6a4f] text-white text-xs flex items-center justify-center font-medium">
                  {user.email?.[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={signOut}
                className="p-1.5 text-[#9ca3af] hover:text-[#0d0d0d] transition-colors"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
