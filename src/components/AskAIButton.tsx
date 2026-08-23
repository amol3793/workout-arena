"use client";

import { useState } from "react";
import { getVisitorId } from "@/lib/visitor";

/**
 * "Ask AI" button that can be placed in exercise/muscle views.
 * Asks the AI for context-aware recommendations based on the current muscle or exercise.
 */
export function AskAIButton({ context }: { context: string }) {
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAI() {
    setOpen(true);
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          message: `Based on my profile and goals, recommend the best exercises for ${context}. Explain why each is recommended in one sentence. Keep it to 3-5 exercises.`,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "AI is not available right now.");
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setResponse(text);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={askAI}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:shadow-xl"
      >
        <span aria-hidden>✨</span>
        Get AI recommendation
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 p-5 ring-1 ring-blue-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">AI recommendation</p>
          <p className="text-xs text-slate-500">Based on your profile and goals</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-700">
          Close ✕
        </button>
      </div>
      {loading && !response && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          Thinking…
        </div>
      )}
      {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
      {response && (
        <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{response}</div>
      )}
    </div>
  );
}
