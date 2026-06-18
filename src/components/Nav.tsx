"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MiseLogo } from "./MiseLogo";
import { useAuthStore } from "@/lib/auth";
import { LogOut, Menu, X } from "lucide-react";

export function Nav() {
  const path = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/recipes", label: "Recipes" },
    { href: "/nutrition", label: "Nutrition" },
    { href: "/fitness", label: "Fitness" },
    { href: "/recommendations", label: "For You" },
    { href: "/grocery", label: "Grocery" },
    { href: "/friends", label: "Friends" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#e5e7eb]/50" style={{ background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
            <MiseLogo size="sm" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
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
              <div className="flex items-center gap-4 ml-2 pl-3 border-l border-[#e5e7eb]">
                <div className="w-7 h-7 rounded-full bg-[#2d6a4f] text-white text-xs flex items-center justify-center font-medium">
                  {(user.user_metadata?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                </div>
                <button onClick={signOut} className="p-1.5 text-[#9ca3af] hover:text-[#0d0d0d] transition-colors" title="Sign out">
                  <LogOut size={15} />
                </button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#6b7280] hover:text-[#0d0d0d] transition-colors"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(245, 240, 232, 0.97)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", paddingTop: "4rem" }}
        >
          <nav className="flex flex-col px-6 py-6 gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl text-base transition-colors ${
                  path === l.href
                    ? "bg-[#2d6a4f] text-white font-medium"
                    : "text-[#0d0d0d] hover:bg-[#f3f4f6]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {user && (
              <div className="mt-6 pt-6 border-t border-[#e5e7eb] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2d6a4f] text-white text-sm flex items-center justify-center font-medium">
                    {(user.user_metadata?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-[#6b7280]">{user.user_metadata?.full_name ?? user.email}</span>
                </div>
                <button
                  onClick={() => { signOut(); setOpen(false); }}
                  className="flex items-center gap-2 text-sm text-[#9ca3af] hover:text-red-500 transition-colors"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
