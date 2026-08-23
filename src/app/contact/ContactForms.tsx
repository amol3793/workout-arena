"use client";

import { type FormEvent, useState } from "react";
import { MARKETING_CONSENT_TEXT } from "@/lib/community";

type State = { status: "idle" | "sending" | "success" | "error"; message?: string };

async function submitJson(url: string, payload: Record<string, unknown>) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as { ok: boolean; error?: string };
  if (!response.ok || !data.ok) throw new Error(data.error ?? "Please try again.");
}

export function ContactForms() {
  const [feedback, setFeedback] = useState<State>({ status: "idle" });
  const [subscribe, setSubscribe] = useState<State>({ status: "idle" });
  const [unsubscribe, setUnsubscribe] = useState<State>({ status: "idle" });
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  async function sendFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setFeedback({ status: "sending" });
    try {
      await submitJson("/api/feedback", {
        type: data.get("type"),
        name: data.get("name"),
        email: data.get("email"),
        message: data.get("message"),
        website: data.get("website"),
        pagePath: document.referrer || window.location.pathname,
      });
      form.reset();
      setFeedback({ status: "success", message: "Thank you — your note is now in the developer review queue." });
    } catch (error) {
      setFeedback({ status: "error", message: error instanceof Error ? error.message : "Please try again." });
    }
  }

  async function joinUpdates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSubscribe({ status: "sending" });
    try {
      await submitJson("/api/subscribe", {
        email: data.get("email"),
        consent: data.get("consent") === "on",
        website: data.get("website"),
        source: "contact-page",
      });
      form.reset();
      setSubscribe({ status: "success", message: "You're on the Easeur update list. Welcome." });
    } catch (error) {
      setSubscribe({ status: "error", message: error instanceof Error ? error.message : "Please try again." });
    }
  }

  async function leaveUpdates(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setUnsubscribe({ status: "sending" });
    try {
      await submitJson("/api/unsubscribe", { email: data.get("email") });
      form.reset();
      setUnsubscribe({ status: "success", message: "That address will no longer receive Easeur marketing updates." });
    } catch (error) {
      setUnsubscribe({ status: "error", message: error instanceof Error ? error.message : "Please try again." });
    }
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-5 ring-1 ring-slate-200 sm:p-7" aria-labelledby="feedback-title">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Reach the developer</p>
        <h2 id="feedback-title" className="mt-2 text-2xl font-bold text-slate-900">Improve Ease your Workout</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Report a misplaced marker, broken image, content correction, or an idea for what Easeur should build next.
        </p>

        <form className="mt-5 space-y-4" onSubmit={sendFeedback}>
          <label className="block text-sm font-semibold text-slate-700">
            What is this about?
            <select name="type" className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="suggestion">Product suggestion</option>
              <option value="bug">Something is broken</option>
              <option value="content">Anatomy or exercise correction</option>
              <option value="other">Something else</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Name <span className="font-normal text-slate-400">(optional)</span>
              <input name="name" autoComplete="name" maxLength={120} className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Reply email <span className="font-normal text-slate-400">(optional)</span>
              <input name="email" type="email" autoComplete="email" maxLength={320} className="mt-1.5 w-full rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Your message
            <textarea name="message" required minLength={10} maxLength={3000} rows={6} placeholder="What happened, where did you see it, and what would make it better?" className="mt-1.5 w-full resize-y rounded-xl border-0 bg-slate-50 px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="hidden" aria-hidden>
            Website<input name="website" tabIndex={-1} autoComplete="off" />
          </label>

          <button disabled={feedback.status === "sending"} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50">
            {feedback.status === "sending" ? "Sending…" : "Send to the developer"}
          </button>
          <Status state={feedback} />
        </form>
      </section>

      <section className="rounded-3xl bg-slate-950 p-5 text-white ring-1 ring-slate-800 sm:p-7" aria-labelledby="updates-title">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Easeur launch notes</p>
        <h2 id="updates-title" className="mt-2 text-2xl font-bold">Hear about useful new tools</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Join only if you want occasional announcements when Easeur launches a meaningful feature or a new app. No account is created.
        </p>

        <form className="mt-5 space-y-4" onSubmit={joinUpdates}>
          <label className="block text-sm font-semibold text-slate-200">
            Email address
            <input name="email" type="email" required autoComplete="email" maxLength={320} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border-0 bg-white/10 px-3 py-3 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </label>
          <label className="flex items-start gap-3 rounded-xl bg-white/5 p-3 text-xs leading-relaxed text-slate-300 ring-1 ring-white/10">
            <input name="consent" type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-400" />
            <span>{MARKETING_CONSENT_TEXT}</span>
          </label>
          <label className="hidden" aria-hidden>
            Website<input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <button disabled={subscribe.status === "sending"} className="w-full rounded-xl bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-50">
            {subscribe.status === "sending" ? "Joining…" : "Email me meaningful updates"}
          </button>
          <Status state={subscribe} dark />
        </form>

        <div className="mt-5 border-t border-white/10 pt-4">
          <button type="button" onClick={() => setShowUnsubscribe((v) => !v)} className="text-xs font-semibold text-slate-400 underline hover:text-white">
            {showUnsubscribe ? "Hide unsubscribe" : "Unsubscribe from updates"}
          </button>
          {showUnsubscribe && (
            <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={leaveUpdates}>
              <input name="email" type="email" required placeholder="Subscribed email" className="min-w-0 flex-1 rounded-xl border-0 bg-white/10 px-3 py-2.5 text-sm text-white ring-1 ring-inset ring-white/20 placeholder:text-slate-500" />
              <button disabled={unsubscribe.status === "sending"} className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white ring-1 ring-white/20 hover:bg-white/15">
                Remove me
              </button>
              <Status state={unsubscribe} dark />
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Status({ state, dark = false }: { state: State; dark?: boolean }) {
  if (!state.message) return null;
  return (
    <p
      role="status"
      className={`rounded-xl px-3 py-2 text-sm ${
        state.status === "success"
          ? dark ? "bg-emerald-400/10 text-emerald-200" : "bg-emerald-50 text-emerald-800"
          : dark ? "bg-rose-400/10 text-rose-200" : "bg-rose-50 text-rose-800"
      }`}
    >
      {state.message}
    </p>
  );
}
