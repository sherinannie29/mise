"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function MiseLogo() {
  return (
    <svg width="90" height="60" viewBox="0 0 72 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* "mise" text path using a display serif style */}
      {/* m */}
      <text
        x="2"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        fill="#0d0d0d"
        letterSpacing="-0.5"
      >
        m
      </text>
      {/* i — no dot, we'll add leaf */}
      <text
        x="28"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        fill="#0d0d0d"
      >
        i
      </text>
      {/* leaf replacing the dot of i */}
      <ellipse cx="31.5" cy="6" rx="3.5" ry="5" fill="#40916c" transform="rotate(-20 31.5 6)" />
      <ellipse cx="31.5" cy="6" rx="1" ry="4" fill="#2d6a4f" transform="rotate(-20 31.5 6)" />
      {/* s */}
      <text
        x="37"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        fill="#0d0d0d"
      >
        s
      </text>
      {/* e */}
      <text
        x="51"
        y="30"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="28"
        fontWeight="700"
        fill="#0d0d0d"
      >
        e
      </text>
    </svg>
  );
}

export function Nav() {
  const path = usePathname();

  const links = [
    { href: "/", label: "Recipes" },
    { href: "/recommendations", label: "For You" },
    { href: "/add", label: "+ Add" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f0e8] border-b border-[#e5e7eb]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <MiseLogo />
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
        </nav>
      </div>
    </header>
  );
}
