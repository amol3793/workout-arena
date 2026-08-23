"use client";

import { useCallback, useEffect, useState } from "react";
import { getVisitorId } from "@/lib/visitor";
import type { WorkoutDay, WorkoutPlanData } from "@/db/schema";
import { ProfileSetup } from "./ProfileSetup";

type Phase = "loading" | "setup" | "plan" | "generating";

export function WorkoutClient() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [plan, setPlan] = useState<{ planData: WorkoutPlanData; name: string; id: number } | null>(null);
  const [activeDay, setActiveDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    const vid = getVisitorId();
    if (!vid) { setPhase("setup"); return; }
    try {
      const [pRes, plRes] = await Promise.all([
        fetch(`/api/ai/profile?visitorId=${vid}`).then((r) => r.json()),
        fetch(`/api/ai/plan?visitorId=${vid}`).then((r) => r.json()),
      ]);
      setProfile(pRes.profile);
      setPlan(plRes.plan);
      setPhase(pRes.profile ? "plan" : "setup");
    } catch { setPhase("setup"); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function generatePlan() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId() }),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? "Failed to generate plan"); return; }
      setPlan(data.plan);
      setPhase("plan");
    } catch { setError("Network error. Please try again."); }
    finally { setGenerating(false); }
  }

  if (phase === "loading") return <LoadingState />;

  if (phase === "setup") {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Step 1</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">Set up your fitness profile</h2>
          <p className="mt-1 text-sm text-slate-600">This helps the AI create a plan matched to you.</p>
        </div>
        <ProfileSetup initial={profile} onComplete={() => { loadData(); setPhase("plan"); }} />
      </div>
    );
  }

  const days = plan?.planData?.weeklySchedule ?? [];

  return (
    <div>
      {/* Plan header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{plan?.name ?? "Your Workout Plan"}</h2>
          <p className="text-sm text-slate-600">{days.length} training days per week</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPhase("setup")}
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Edit profile
          </button>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {generating ? "Generating…" : "Regenerate plan"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

      {!plan && !generating && (
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-blue-50 to-white p-8 text-center ring-1 ring-blue-100">
          <span className="text-4xl">🤖</span>
          <h3 className="mt-3 text-xl font-bold text-slate-900">Ready to create your plan?</h3>
          <p className="mt-2 text-sm text-slate-600">
            The AI will use your profile to build a personalized weekly workout.
          </p>
          <button
            onClick={generatePlan}
            className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Generate my workout plan
          </button>
        </div>
      )}

      {days.length > 0 && (
        <div className="mt-6">
          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  activeDay === i
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                {day.dayLabel.split("—")[0].trim()}
              </button>
            ))}
          </div>

          {/* Active day */}
          <DayCard day={days[activeDay]} />
        </div>
      )}
    </div>
  );
}

function DayCard({ day }: { day: WorkoutDay }) {
  return (
    <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{day.dayLabel}</h3>
          <p className="text-sm text-slate-500">{day.focus} · ~{day.estimatedMinutes} min</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {day.exercises.length} exercises
        </span>
      </div>

      {day.warmup && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          <span className="font-semibold">Warm-up:</span> {day.warmup}
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {day.exercises.map((ex, i) => (
          <li key={i} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-900">{ex.name}</p>
              <p className="text-sm text-slate-500">
                {ex.sets} × {ex.reps} · {ex.restSeconds}s rest
                {ex.targetMuscle && <span className="ml-2 text-xs text-slate-400">({ex.targetMuscle})</span>}
              </p>
              {ex.notes && <p className="mt-1 text-xs text-slate-500">{ex.notes}</p>}
            </div>
            {ex.suggestedWeight && (
              <span className="shrink-0 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {ex.suggestedWeight}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid min-h-[300px] place-items-center">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        <p className="mt-4 text-sm text-slate-500">Loading your workout…</p>
      </div>
    </div>
  );
}
