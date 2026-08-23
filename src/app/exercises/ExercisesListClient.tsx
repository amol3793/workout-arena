"use client";

import { useCallback, useMemo, useState } from "react";
import { ExerciseCard } from "@/components/ExerciseCard";
import { SearchFilter } from "@/components/SearchFilter";
import { EXERCISES } from "@/data";
import type { Exercise } from "@/data/types";

export type SourceTab = "all" | "ymove" | "repdb" | "free-exercise-db" | "opengym";

const TABS: { id: SourceTab; label: string; helper: string; match: (e: Exercise) => boolean }[] = [
  {
    id: "all",
    label: "All",
    helper: "Every exercise — the best available demo is shown.",
    match: () => true,
  },
  {
    id: "opengym",
    label: "OpenGym",
    helper: "1,295 exercises with animated GIF demos. © Gym visual.",
    match: (e) => Boolean(e.openGymGif),
  },
  {
    id: "ymove",
    label: "YMove",
    helper: "Real human HD video. Royalty-free, self-hosted.",
    match: (e) => Boolean(e.video),
  },
  {
    id: "repdb",
    label: "RepDB",
    helper: "Illustrated start/peak frames from the RepDB free dataset.",
    match: (e) => Boolean(e.repdbImageId),
  },
  {
    id: "free-exercise-db",
    label: "Free Exercise DB",
    helper: "Real human photo pairs. Public domain (Unlicense).",
    match: (e) => Boolean(e.externalMediaId),
  },
];

export function ExercisesListClient() {
  const [tab, setTab] = useState<SourceTab>("all");

  const matchText = useCallback(
    (ex: Exercise) =>
      `${ex.name} ${ex.primaryMuscles.join(" ")} ${ex.equipment.join(" ")} ${ex.difficulty}`,
    [],
  );

  const items = useMemo(() => {
    const t = TABS.find((t) => t.id === tab)!;
    return EXERCISES.filter(t.match);
  }, [tab]);

  return (
    <div>
      {/* Source tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2" role="tablist" aria-label="Media source">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count = t.id === "all" ? EXERCISES.length : null;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
              {count !== null && (
                <span className={`ml-1.5 text-xs ${active ? "text-slate-300" : "text-slate-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {TABS.find((t) => t.id === tab)!.helper}
      </p>

      <SearchFilter
        items={items}
        matchText={matchText}
        placeholder="Search exercises — e.g. lateral raise, beginner, dumbbells…"
        emptyMessage="No exercises match your search."
      >
        {(filtered, query) => (
          <>
            {query && (
              <p className="mt-3 text-sm text-slate-500">
                Showing {filtered.length} of {items.length} exercises
              </p>
            )}
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </>
        )}
      </SearchFilter>
    </div>
  );
}
