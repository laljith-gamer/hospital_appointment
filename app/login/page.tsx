"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setError(error.message === "Signups not allowed" ? "Sign-ins are not allowed right now." : "Could not send the sign-in link. Please try again.");
    else setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-3 text-sm text-slate-600">
          We sent a secure sign-in link to <strong>{email}</strong>. Open it on this
          device to finish signing in.
        </p>
        <p className="mt-6 text-xs text-slate-400">The link expires in one hour.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-500">
        Sign in to book appointments and manage your bookings.
      </p>

      <form onSubmit={sendMagicLink} className="mt-8 space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            autoComplete="email"
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {loading ? "Sending…" : "Continue"}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-400">
        We will send a secure sign-in link to your email.
      </p>
      <p className="mt-6 text-sm text-slate-600">
        You can also{" "}
        <Link href="/doctors" className="font-medium text-primary-dark hover:underline">
          browse doctors
        </Link>{" "}
        without signing in.
      </p>
      {/* Keeps searchParams dependency explicit for static generation */}
      <span className="hidden">{searchParams.get("next") ?? ""}</span>
    </div>
  );
}