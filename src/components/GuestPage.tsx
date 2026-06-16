"use client";

import { useAuthStore } from "@/lib/auth";

export function GuestPage() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1767114915974-3481fa23cbb0?q=80&w=2242&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-8">
        <div style={{ marginBottom: "2rem" }}>
          <span style={{
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            fontSize: "4.5rem",
            color: "rgba(255,255,255,0.95)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>mise</span>
        </div>

        <h1 style={{
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          marginBottom: "1.5rem",
        }}>
          Your recipes,<br />all in one place.
        </h1>

        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", marginBottom: "2.5rem", maxWidth: "420px", lineHeight: 1.6 }}>
          Save the dishes you love and get personalised recommendations based on what you cook.
        </p>

        <button
          onClick={signInWithGoogle}
          className="flex items-center gap-3 px-6 py-3.5 bg-white/15 border border-white/30 backdrop-blur-sm rounded-xl text-sm font-medium text-white hover:bg-white/25 transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}
