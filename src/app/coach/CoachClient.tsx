"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { getVisitorId } from "@/lib/visitor";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "What should I train today?",
  "How should I progress on bench press?",
  "Can I replace squats with leg press?",
  "I missed Monday. How should I adjust?",
  "Which muscles am I neglecting?",
];

export function CoachClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const message = text ?? input.trim();
    if (!message || streaming) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId(), message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Connection failed" }));
        setMessages((prev) => [...prev, { role: "assistant", content: data.error ?? "Something went wrong. Please try again." }]);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please check your connection." }]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[400px] flex-col rounded-3xl bg-white ring-1 ring-slate-200 sm:h-[calc(100vh-240px)]">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md pt-8 text-center">
            <span className="text-5xl">🏋️‍♂️</span>
            <h3 className="mt-4 text-xl font-bold text-slate-900">Your AI training partner</h3>
            <p className="mt-2 text-sm text-slate-600">
              Ask about your workout plan, exercise alternatives, progression, recovery — anything training-related.
              The AI uses your profile and workout history for personalized answers.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-800 ring-1 ring-slate-200"
                }`}
              >
                {msg.role === "assistant" && (
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-blue-600">
                    AI Coach
                  </span>
                )}
                <div className="whitespace-pre-wrap">{msg.content || "…"}</div>
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <span className="inline-flex gap-1 text-slate-400">
                  <span className="animate-bounce">·</span>
                  <span className="animate-bounce [animation-delay:100ms]">·</span>
                  <span className="animate-bounce [animation-delay:200ms]">·</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3 sm:p-4">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI coach…"
          disabled={streaming}
          className="min-w-0 flex-1 rounded-xl border-0 bg-slate-50 px-4 py-3 text-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
