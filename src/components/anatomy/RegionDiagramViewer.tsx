"use client";

import { getMuscle } from "@/data";
import type { CanonicalMuscleId, RegionId } from "@/lib/anatomy/types";
import { REGION_DIAGRAMS, type DiagramDot } from "./hotspots";

interface RegionDiagramViewerProps {
  region: RegionId;
  selectedId?: CanonicalMuscleId | null;
  highlightedId?: CanonicalMuscleId | null;
  onSelect?: (id: CanonicalMuscleId) => void;
  onHighlight?: (id: CanonicalMuscleId | null) => void;
  reducedMotion?: boolean;
  active?: boolean;
}

/** One label per canonical muscle, distributed to avoid vertical collisions. */
function layoutLabels(dots: DiagramDot[]) {
  const unique = new Map<CanonicalMuscleId, DiagramDot>();
  for (const dot of dots) if (!unique.has(dot.id)) unique.set(dot.id, dot);

  const result = new Map<CanonicalMuscleId, number>();
  for (const edge of ["left", "right"] as const) {
    const group = [...unique.values()]
      .filter((dot) => dot.edge === edge)
      .sort((a, b) => a.y - b.y);
    const minGap = group.length > 4 ? 9 : 11;
    let previous = 6;
    const placed = group.map((dot) => {
      const y = Math.max(8, dot.y, previous + minGap);
      previous = y;
      return { id: dot.id, y };
    });
    const overflow = Math.max(0, (placed.at(-1)?.y ?? 0) - 92);
    for (const label of placed) result.set(label.id, label.y - overflow);
  }
  return result;
}

/**
 * Dedicated regional artwork with pixel-detected muscle dots. A full-size SVG
 * overlay draws real straight leader lines from every dot to one collision-safe
 * edge label per canonical muscle. Bilateral dots share one label.
 */
export function RegionDiagramViewer({
  region,
  selectedId,
  highlightedId,
  onSelect,
  onHighlight,
  reducedMotion,
  active = true,
}: RegionDiagramViewerProps) {
  const diagram = REGION_DIAGRAMS[region];
  if (!diagram) return null;

  const anySelected = Boolean(selectedId);
  const portrait = diagram.aspect === "aspect-[2/3]";
  const labelY = layoutLabels(diagram.dots);
  const uniqueDots = [...new Map(diagram.dots.map((dot) => [dot.id, dot])).values()];

  return (
    <div
      className={`relative mx-auto ${diagram.aspect} ${
        portrait ? "w-full max-w-[320px]" : "w-full max-w-[560px]"
      }`}
    >
      <img
        src={diagram.image}
        alt={`Anatomical diagram of the ${region} with labeled muscles.`}
        width={1100}
        height={800}
        className="absolute inset-0 h-full w-full select-none rounded-xl bg-slate-50 object-cover"
        draggable={false}
      />

      {anySelected && <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/40" aria-hidden />}

      {/* Straight lines: full canvas, so lengths are based on the image—not a zero-width anchor. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        {diagram.dots.map((dot, i) => {
          const y2 = labelY.get(dot.id) ?? dot.y;
          const x2 = dot.edge === "left" ? 4 : 96;
          const selected = selectedId === dot.id;
          return (
            <line
              key={`${dot.id}-${i}`}
              x1={dot.x}
              y1={dot.y}
              x2={x2}
              y2={y2}
              stroke={selected ? "#0f172a" : "#475569"}
              strokeWidth={selected ? 0.7 : 0.42}
              strokeDasharray="1.1 1.4"
              vectorEffect="non-scaling-stroke"
              opacity={anySelected && !selected ? 0.3 : 0.72}
            />
          );
        })}
      </svg>

      {/* Dots exactly on color-detected muscle centroids. */}
      {diagram.dots.map((dot, i) => {
        const muscle = getMuscle(dot.id);
        if (!muscle) return null;
        const selected = selectedId === dot.id;
        const highlighted = highlightedId === dot.id;
        return (
          <button
            key={`${dot.id}-dot-${i}`}
            type="button"
            onClick={() => onSelect?.(dot.id)}
            onMouseEnter={() => onHighlight?.(dot.id)}
            onMouseLeave={() => onHighlight?.(null)}
            onFocus={() => onHighlight?.(dot.id)}
            onBlur={() => onHighlight?.(null)}
            aria-label={`${muscle.name}. ${muscle.summary}`}
            aria-pressed={selected}
            tabIndex={active ? 0 : -1}
            className="absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ring-2 ring-white shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              backgroundColor: muscle.color,
              opacity: anySelected && !selected ? 0.42 : highlighted ? 1 : 0.9,
              boxShadow: selected ? `0 0 0 3px #0f172a, 0 0 14px 3px ${muscle.color}` : undefined,
              transition: reducedMotion ? undefined : "opacity .2s, box-shadow .2s",
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
          </button>
        );
      })}

      {/* One label per muscle, with collision-aware y placement at the image edge. */}
      {uniqueDots.map((dot) => {
        const muscle = getMuscle(dot.id);
        if (!muscle) return null;
        const selected = selectedId === dot.id;
        return (
          <button
            key={`${dot.id}-label`}
            type="button"
            onClick={() => onSelect?.(dot.id)}
            onMouseEnter={() => onHighlight?.(dot.id)}
            onMouseLeave={() => onHighlight?.(null)}
            aria-pressed={selected}
            tabIndex={active ? 0 : -1}
            className={`absolute -translate-y-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold shadow-md ring-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-2.5 sm:text-xs ${
              selected
                ? "bg-slate-900 text-white ring-slate-900"
                : "bg-white/95 text-slate-800 ring-slate-200"
            } ${dot.edge === "left" ? "left-1.5" : "right-1.5"}`}
            style={{ top: `${labelY.get(dot.id) ?? dot.y}%` }}
          >
            {muscle.shortName}
          </button>
        );
      })}
    </div>
  );
}
