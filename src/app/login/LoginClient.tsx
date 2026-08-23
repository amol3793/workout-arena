"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export function LoginClient() {
  const { user, login, logout, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-3 text-sm text-slate-500">Checking session…</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="w-full rounded-3xl bg-white p-6 text-center ring-1 ring-slate-200 sm:p-8">
        <span className="text-4xl">👋</span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Welcome back{user.name ? `, ${user.name}` : ""}!</h1>
        <p className="mt-2 text-sm text-slate-600">{user.email}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button onClick={() => router.push("/workout")} className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">
            Go to My Workout →
          </button>
          <button onClick={() => router.push("/coach")} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">
            Open AI Coach →
          </button>
          <button onClick={logout} className="mt-2 text-sm font-semibold text-slate-500 hover:text-slate-800">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, name || undefined);
    setSubmitting(false);
    if (result.ok) {
      router.push("/workout");
    } else {
      setError(result.error ?? "Something went wrong");
    }
  }

  return (
    <div className="w-full">
      <div className="text-center">
        <span className="text-4xl">🏋️</span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Sign in to train</h1>
        <p className="mt-2 text-sm text-slate-600">
          Access your AI workout plan, track progress, and get personalized coaching.
          The Explore experience stays free without an account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Email address</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Name <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
            className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Signing in…" : "Sign in & start training"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-400">
        No password needed. Your email is used only to identify your workout data across sessions.
      </p>
    </div>
  );
}
