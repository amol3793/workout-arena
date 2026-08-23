"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getVisitorId } from "@/lib/visitor";

interface Session {
  id: number;
  dayLabel: string | null;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
}

interface SetRecord {
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  completed: boolean;
}

export function ProgressClient() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sets, setSets] = useState<SetRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const vid = getVisitorId();
    if (!vid) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/ai/log?visitorId=${vid}`);
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setSets(data.recentSets ?? []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="grid min-h-[200px] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-white p-8 text-center ring-1 ring-slate-200">
        <span className="text-4xl">📊</span>
        <h3 className="mt-4 text-xl font-bold text-slate-900">No workouts logged yet</h3>
        <p className="mt-2 text-sm text-slate-600">
          Start training with your AI plan and your progress will appear here.
        </p>
        <Link
          href="/workout"
          className="mt-5 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
        >
          Go to My Workout →
        </Link>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.completedAt).length;
  const totalVolume = sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);

  return (
    <div>
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total sessions" value={String(totalSessions)} icon="🏋️" />
        <StatCard label="Completed" value={String(completedSessions)} icon="✅" />
        <StatCard label="Recent volume (kg)" value={Math.round(totalVolume).toLocaleString()} icon="📈" />
      </div>

      {/* Recent sessions */}
      <h2 className="mt-8 text-lg font-bold text-slate-900">Recent sessions</h2>
      <ul className="mt-4 space-y-3">
        {sessions.map((session) => (
          <li key={session.id} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{session.dayLabel ?? "Workout"}</p>
                <p className="text-sm text-slate-500">
                  {new Date(session.startedAt).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                session.completedAt
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}>
                {session.completedAt ? "Completed" : "In progress"}
              </span>
            </div>
            {session.notes && <p className="mt-2 text-sm text-slate-600">{session.notes}</p>}
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link
          href="/coach"
          className="inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"
        >
          Ask AI Coach for progress analysis →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <span className="text-2xl" aria-hidden>{icon}</span>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
