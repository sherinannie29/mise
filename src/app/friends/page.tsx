"use client";

import { useEffect, useState } from "react";
import { useFriendsStore } from "@/lib/friends";
import { UserPlus, Check, X, Users, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";

export default function FriendsPage() {
  const { friends, pending, loading, fetchFriends, sendRequest, acceptRequest, declineRequest, removeFriend } = useFriendsStore();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { fetchFriends(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const result = await sendRequest(email.trim().toLowerCase());
    if (result.error) {
      setMessage({ text: result.error, error: true });
    } else {
      setMessage({ text: "Friend request sent!", error: false });
      setEmail("");
    }
    setSending(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const initials = (name: string | null, email: string) =>
    (name ?? email)[0].toUpperCase();

  return (
    <div className="min-h-screen relative">
      <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80" alt="" className="fixed inset-0 w-full h-full object-cover -z-10" style={{ filter: "blur(18px) brightness(0.7) saturate(0.8)", transform: "scale(1.15)" }} />
      <div className="fixed inset-0 -z-10" style={{ background: "rgba(5, 20, 10, 0.45)" }} />
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Friends</h1>
        <p className="text-white/70 text-sm">See what your friends are cooking.</p>
      </div>

      {/* Add friend */}
      <form onSubmit={handleAdd} className="mb-8">
        <label className="block text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-1.5">
          Add by email
        </label>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@email.com"
            required
            className="flex-1 px-3.5 py-2.5 text-sm border border-[#e5e7eb] rounded-xl bg-white focus:outline-none focus:border-[#2d6a4f] transition-colors"
          />
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white text-sm rounded-xl hover:bg-[#40916c] transition-colors disabled:opacity-50"
          >
            <UserPlus size={15} />
            Add
          </button>
        </div>
        {message && (
          <p className={`mt-2 text-sm ${message.error ? "text-red-500" : "text-[#40916c]"}`}>
            {message.text}
          </p>
        )}
      </form>

      {/* Pending requests */}
      {pending.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
            Pending requests ({pending.length})
          </h2>
          <div className="space-y-2">
            {pending.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-4 bg-white border border-[#e5e7eb] rounded-2xl">
                <div className="w-9 h-9 rounded-full bg-[#d8f3dc] text-[#2d6a4f] text-sm flex items-center justify-center font-medium shrink-0">
                  {initials(f.profile?.fullName ?? null, f.profile?.email ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.profile?.fullName ?? f.profile?.email}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{f.profile?.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptRequest(f.id)} className="p-2 bg-[#2d6a4f] text-white rounded-lg hover:bg-[#40916c] transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => declineRequest(f.id)} className="p-2 text-[#9ca3af] border border-[#e5e7eb] rounded-lg hover:text-red-500 hover:border-red-200 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Friends list */}
      <section>
        <h2 className="text-xs font-medium text-[#6b7280] uppercase tracking-wider mb-3">
          {friends.length > 0 ? `Friends (${friends.length})` : "Friends"}
        </h2>
        {loading ? (
          <p className="text-sm text-[#9ca3af]">Loading…</p>
        ) : friends.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[#e5e7eb] rounded-2xl">
            <Users size={32} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-sm text-[#9ca3af]">No friends yet — add someone above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center gap-3 p-4 bg-white border border-[#e5e7eb] rounded-2xl group">
                <div className="w-9 h-9 rounded-full bg-[#d8f3dc] text-[#2d6a4f] text-sm flex items-center justify-center font-medium shrink-0">
                  {initials(f.profile?.fullName ?? null, f.profile?.email ?? "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{f.profile?.fullName ?? f.profile?.email}</p>
                  <p className="text-xs text-[#9ca3af] truncate">{f.profile?.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFriend(f.id)}
                    className="p-2 text-[#9ca3af] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                  <Link
                    href={`/friends/${f.profile?.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#2d6a4f] border border-[#2d6a4f] rounded-lg hover:bg-[#2d6a4f] hover:text-white transition-colors"
                  >
                    View recipes
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}
