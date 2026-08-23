import Link from "next/link";
import type { Muscle } from "@/data/types";

/** Compact, beginner-friendly muscle info block used in the explorer panel. */
export function MuscleInfo({ muscle }: { muscle: Muscle }) {
  return (
    <div>
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-9 w-9 shrink-0 rounded-lg ring-2 ring-white shadow"
          style={{ backgroundColor: muscle.color }}
          aria-hidden
        />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">{muscle.name}</h3>
            {muscle.layer === "deep" && (
              <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
                Deep muscle
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">{muscle.location}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-slate-600">{muscle.summary}</p>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Primary function
          </dt>
          <dd className="mt-1 text-sm text-slate-800">{muscle.functions[0]}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </dt>
          <dd className="mt-1 text-sm text-slate-800">{muscle.location}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <Link
          href={`/muscles/${muscle.id}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          View exercises for {muscle.shortName} →
        </Link>
      </div>
    </div>
  );
}
