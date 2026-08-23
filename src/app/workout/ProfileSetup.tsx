"use client";

import { type FormEvent, useState } from "react";
import { getVisitorId } from "@/lib/visitor";

const GOALS = [
  { value: "muscle-gain", label: "Muscle gain", icon: "💪" },
  { value: "strength", label: "Strength", icon: "🏋️" },
  { value: "fat-loss", label: "Fat loss", icon: "🔥" },
  { value: "general-fitness", label: "General fitness", icon: "🎯" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
];

const EXPERIENCE = [
  { value: "beginner", label: "Beginner", desc: "Less than 6 months" },
  { value: "intermediate", label: "Intermediate", desc: "6 months to 2 years" },
  { value: "advanced", label: "Advanced", desc: "Over 2 years" },
];

const EQUIPMENT = [
  "Barbell", "Dumbbells", "Cable", "Machines", "Pull-up bar",
  "Bench", "Kettlebell", "Resistance band", "Bodyweight only",
];

interface Props {
  onComplete: () => void;
  initial?: Record<string, unknown> | null;
}

export function ProfileSetup({ onComplete, initial }: Props) {
  const [goal, setGoal] = useState(String(initial?.goal ?? "general-fitness"));
  const [experience, setExperience] = useState(String(initial?.experience ?? "beginner"));
  const [days, setDays] = useState(Number(initial?.trainingDays) || 3);
  const [duration, setDuration] = useState(Number(initial?.workoutDuration) || 45);
  const [equipment, setEquipment] = useState<string[]>((initial?.equipment as string[]) ?? []);
  const [saving, setSaving] = useState(false);

  function toggleEquip(item: string) {
    setEquipment((prev) => prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/ai/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId: getVisitorId(),
          goal, experience, trainingDays: days, workoutDuration: duration, equipment,
        }),
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-8">
      {/* Goal */}
      <fieldset>
        <legend className="text-sm font-bold uppercase tracking-wide text-slate-500">Your fitness goal</legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setGoal(g.value)}
              className={`rounded-2xl p-4 text-center ring-1 transition ${
                goal === g.value
                  ? "bg-blue-600 text-white ring-blue-600 shadow-lg shadow-blue-600/20"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-300"
              }`}
            >
              <span className="block text-2xl">{g.icon}</span>
              <span className="mt-1 block text-sm font-semibold">{g.label}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Experience */}
      <fieldset>
        <legend className="text-sm font-bold uppercase tracking-wide text-slate-500">Experience level</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {EXPERIENCE.map((exp) => (
            <button
              key={exp.value}
              type="button"
              onClick={() => setExperience(exp.value)}
              className={`rounded-2xl p-4 text-left ring-1 transition ${
                experience === exp.value
                  ? "bg-blue-600 text-white ring-blue-600"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-300"
              }`}
            >
              <span className="block font-semibold">{exp.label}</span>
              <span className={`block text-xs ${experience === exp.value ? "text-blue-100" : "text-slate-500"}`}>{exp.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Training days + duration */}
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Training days per week</span>
          <div className="mt-3 flex gap-2">
            {[2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={`grid h-12 w-12 place-items-center rounded-xl text-lg font-bold ring-1 transition ${
                  days === d ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-bold uppercase tracking-wide text-slate-500">Workout duration</span>
          <div className="mt-3 flex gap-2">
            {[30, 45, 60, 75, 90].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                className={`rounded-xl px-3 py-3 text-sm font-bold ring-1 transition ${
                  duration === m ? "bg-blue-600 text-white ring-blue-600" : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-300"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </label>
      </div>

      {/* Equipment */}
      <fieldset>
        <legend className="text-sm font-bold uppercase tracking-wide text-slate-500">Available equipment</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {EQUIPMENT.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => toggleEquip(eq)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                equipment.includes(eq)
                  ? "bg-blue-600 text-white ring-blue-600"
                  : "bg-white text-slate-700 ring-slate-200 hover:ring-blue-300"
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Saving…" : initial ? "Update profile & continue" : "Save profile & generate plan"}
      </button>
    </form>
  );
}
