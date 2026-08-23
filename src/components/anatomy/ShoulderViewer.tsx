"use client";

import { getInteractiveMuscles, getMuscle } from "@/data";
import type { CanonicalMuscleId } from "@/lib/anatomy/types";
import { DELTOID_HOTSPOTS } from "./hotspots";

interface ShoulderViewerProps {
  selectedId?: CanonicalMuscleId | null;
  highlightedId?: CanonicalMuscleId | null;
  onSelect?: (id: CanonicalMuscleId) => void;
  onHighlight?: (id: CanonicalMuscleId | null) => void;
  reducedMotion?: boolean;
  active?: boolean;
}

const SHOULDER_MUSCLES = getInteractiveMuscles("shoulder");
const SURFACE = SHOULDER_MUSCLES.filter((m) => m.id.endsWith("-deltoid"));
const DEEP = SHOULDER_MUSCLES.filter((m) => !m.id.endsWith("-deltoid"));

/**
 * Shoulder-specific close-up. The image carries only unobtrusive dots; names
 * live in two clearly separated selector groups below it, preventing the former
 * overlap between deltoid labels, the deep-muscle strip and Explorer chips.
 */
export function ShoulderViewer({
  selectedId,
  highlightedId,
  onSelect,
  onHighlight,
  reducedMotion,
  active = true,
}: ShoulderViewerProps) {
  const anySelected = Boolean(selectedId);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <div className="relative aspect-[2/3] w-[188px] shrink-0 sm:w-[240px] lg:w-[250px]">
        <img
          src="/anatomy/shoulder.webp"
          alt="Shoulder anatomy showing the anterior, lateral and posterior deltoid heads."
          width={1000}
          height={1500}
          className="absolute inset-0 h-full w-full select-none rounded-xl bg-slate-50 object-cover"
          draggable={false}
        />

        {anySelected && <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/40" aria-hidden />}

        {/* Dotted guides align the three visible heads with the three selector columns below. */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {DELTOID_HOTSPOTS.map((hotspot, i) => (
            <line
              key={hotspot.id}
              x1={hotspot.x}
              y1={hotspot.y}
              x2={[16.7, 50, 83.3][i]}
              y2="99"
              stroke="#475569"
              strokeWidth="0.45"
              strokeDasharray="1.1 1.4"
              vectorEffect="non-scaling-stroke"
              opacity={selectedId && selectedId !== hotspot.id ? 0.22 : 0.6}
            />
          ))}
        </svg>

        {DELTOID_HOTSPOTS.map((hotspot) => {
          const muscle = getMuscle(hotspot.id);
          if (!muscle) return null;
          const selected = selectedId === hotspot.id;
          const highlighted = highlightedId === hotspot.id;
          return (
            <button
              key={hotspot.id}
              type="button"
              onClick={() => onSelect?.(hotspot.id)}
              onMouseEnter={() => onHighlight?.(hotspot.id)}
              onMouseLeave={() => onHighlight?.(null)}
              onFocus={() => onHighlight?.(hotspot.id)}
              onBlur={() => onHighlight?.(null)}
              aria-label={`${muscle.name}. ${muscle.summary}`}
              aria-pressed={selected}
              tabIndex={active ? 0 : -1}
              className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-2 ring-white shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                backgroundColor: muscle.color,
                opacity: anySelected && !selected ? 0.4 : highlighted ? 1 : 0.9,
                boxShadow: selected ? `0 0 0 3px #0f172a, 0 0 16px 3px ${muscle.color}` : undefined,
                transition: reducedMotion ? undefined : "opacity .2s, box-shadow .2s",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="mt-2 w-full shrink-0 rounded-xl bg-white p-2.5 ring-1 ring-slate-200">
        <MuscleGroup
          title="Deltoid heads"
          muscles={SURFACE}
          selectedId={selectedId}
          onSelect={onSelect}
          onHighlight={onHighlight}
          active={active}
          columns="grid-cols-3"
        />
        <div className="my-2 border-t border-slate-100" />
        <MuscleGroup
          title="Rotator cuff & supporting"
          muscles={DEEP}
          selectedId={selectedId}
          onSelect={onSelect}
          onHighlight={onHighlight}
          active={active}
          columns="grid-cols-2 sm:grid-cols-3"
        />
      </div>
    </div>
  );
}

function MuscleGroup({
  title,
  muscles,
  selectedId,
  onSelect,
  onHighlight,
  active,
  columns,
}: {
  title: string;
  muscles: ReturnType<typeof getInteractiveMuscles>;
  selectedId?: CanonicalMuscleId | null;
  onSelect?: (id: CanonicalMuscleId) => void;
  onHighlight?: (id: CanonicalMuscleId | null) => void;
  active: boolean;
  columns: string;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 sm:text-xs">
        {title}
      </h3>
      <ul className={`grid gap-1.5 ${columns}`}>
        {muscles.map((muscle) => {
          const selected = selectedId === muscle.id;
          return (
            <li key={muscle.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect?.(muscle.id)}
                onMouseEnter={() => onHighlight?.(muscle.id)}
                onMouseLeave={() => onHighlight?.(null)}
                onFocus={() => onHighlight?.(muscle.id)}
                onBlur={() => onHighlight?.(null)}
                aria-pressed={selected}
                tabIndex={active ? 0 : -1}
                className={`flex min-h-9 w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-xs ${
                  selected ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white" style={{ backgroundColor: muscle.color }} aria-hidden />
                <span className="min-w-0 truncate">{muscle.shortName}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
