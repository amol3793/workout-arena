"use client";

import { getRegion } from "@/data";
import type { BodySide, RegionId } from "@/lib/anatomy/types";
import { BODY_REGION_HOTSPOTS } from "./hotspots";

interface FullBodyViewerProps {
  side: BodySide;
  active?: boolean;
  onSelectRegion?: (region: RegionId) => void;
  reducedMotion?: boolean;
}

/**
 * Full body with clean in-canvas annotation columns.
 *
 * The labels stay INSIDE the same viewer canvas, so mobile screens keep both the
 * body and the text in one stable layout. Straight dotted connectors run from
 * each exact body marker to a compact label column on the left or right.
 */
export function FullBodyViewer({
  side,
  active,
  onSelectRegion,
  reducedMotion,
}: FullBodyViewerProps) {
  const hotspots = BODY_REGION_HOTSPOTS[side];

  return (
    <div className="relative mx-auto aspect-[2/3] h-full max-h-full overflow-hidden rounded-xl">
      <img
        src={`/anatomy/body-${side}.webp`}
        alt={`Human muscular anatomy, ${side} view, with labeled body regions.`}
        width={1024}
        height={1536}
        className="absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
        fetchPriority="high"
      />

      {/* Dotted connector lines remain inside the same canvas. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        {hotspots.map((hotspot, i) => (
          <line
            key={`${hotspot.region}-${i}`}
            x1={hotspot.x}
            y1={hotspot.y}
            x2={hotspot.side === "left" ? 8 : 92}
            y2={hotspot.labelY}
            stroke="#2563eb"
            strokeWidth="0.45"
            strokeDasharray="1.1 1.5"
            vectorEffect="non-scaling-stroke"
            opacity="0.75"
          />
        ))}
      </svg>

      {hotspots.map((hotspot, i) => {
        const region = getRegion(hotspot.region);
        return (
          <div key={`${hotspot.region}-${i}`}>
            <button
              type="button"
              onClick={() => onSelectRegion?.(hotspot.region)}
              aria-label={`${hotspot.label} — explore ${region?.name}`}
              tabIndex={active === false ? -1 : 0}
              className="group absolute grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-600 shadow-lg ring-2 ring-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            >
              {!reducedMotion && (
                <span className="absolute h-7 w-7 animate-ping rounded-full bg-blue-500/30" aria-hidden />
              )}
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
            </button>

            <button
              type="button"
              onClick={() => onSelectRegion?.(hotspot.region)}
              tabIndex={active === false ? -1 : 0}
              className={`absolute -translate-y-1/2 rounded-lg bg-white/95 px-2 py-1 text-left text-[10px] font-bold leading-tight text-slate-800 shadow-md ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-xs ${
                hotspot.side === "left" ? "left-2 max-w-[88px]" : "right-2 max-w-[88px]"
              }`}
              style={{ top: `${hotspot.labelY}%` }}
              aria-label={`Explore ${region?.name}`}
            >
              <span className="block truncate">{region?.name}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
