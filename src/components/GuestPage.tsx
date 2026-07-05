"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { MiseLogo } from "./MiseLogo";

export function GuestPage() {
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);

  const [mode, setMode] = useState<"landing" | "signin" | "signup">("landing");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (mode === "signin") {
      const result = await signInWithEmail(email, password);
      if (result.error) setError(result.error);
    } else {
      const result = await signUpWithEmail(email, password, fullName);
      if (result.error) setError(result.error);
      else setSuccess("Check your email for a confirmation link.");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80"
        alt=""
        className="fixed inset-0 w-full h-full object-cover"
        style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }}
      />
      <div className="absolute inset-0" style={{ background: "rgba(5, 20, 10, 0.5)" }} />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <MiseLogo white size="lg" />
            <p className="text-white text-3xl mt-4 font-semibold tracking-tight">Cook more. Eat better. Live well.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-7" style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.18)" }}>

            {mode === "landing" && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setMode("signup")}
                  className="w-full py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1b4332] transition-colors"
                >
                  Create account
                </button>
                <button
                  onClick={() => setMode("signin")}
                  className="w-full py-3 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Sign in
                </button>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-white/15" />
                  <span className="text-white/30 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/15" />
                </div>
                <button
                  onClick={signInWithGoogle}
                  className="w-full flex items-center justify-center gap-2.5 py-3 text-white text-sm font-medium rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>
            )}

            {(mode === "signin" || mode === "signup") && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <h2 className="text-white font-semibold text-base mb-1">{mode === "signin" ? "Sign in" : "Create account"}</h2>

                {mode === "signup" && (
                  <input
                    type="text"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30"
                    style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm text-white placeholder-white/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-white/30"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
                />

                {error && <p className="text-red-400 text-xs">{error}</p>}
                {success && <p className="text-green-400 text-xs">{success}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1b4332] transition-colors disabled:opacity-50 mt-1"
                >
                  {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>

                <button type="button" onClick={() => { setMode("landing"); setError(""); setSuccess(""); }} className="text-white/40 text-xs text-center hover:text-white/60 transition-colors">
                  ← Back
                </button>
              </form>
            )}
          </div>
        </div>
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
