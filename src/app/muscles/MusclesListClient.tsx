"use client";

import Link from "next/link";
import { useCallback } from "react";
import { SearchFilter } from "@/components/SearchFilter";
import { MUSCLES } from "@/data";
import type { Muscle } from "@/data/types";

export function MusclesListClient() {
  const matchText = useCallback(
    (m: Muscle) => `${m.name} ${m.shortName} ${m.region} ${m.layer} ${m.location}`,
    [],
  );

  return (
    <SearchFilter
      items={MUSCLES}
      matchText={matchText}
      placeholder="Search muscles — e.g. deltoid, trapezius, rotator cuff…"
      emptyMessage="No muscles match your search."
    >
      {(filtered, query) => (
        <>
          {query && (
            <p className="mt-3 text-sm text-slate-500">
              Showing {filtered.length} of {MUSCLES.length} muscles
            </p>
          )}

          {/* Surface muscles */}
          {(() => {
            const surface = filtered.filter((m) => m.layer === "surface");
            if (surface.length === 0) return null;
            return (
              <section className="mt-6">
                <h2 className="text-lg font-bold text-slate-900">Surface muscles</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {surface.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/muscles/${m.id}`}
                        className="block h-full rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:shadow-md hover:ring-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className="inline-flex h-10 w-10 rounded-xl ring-2 ring-white" style={{ backgroundColor: m.color }} aria-hidden />
                        <h3 className="mt-3 font-semibold text-slate-900">{m.name}</h3>
                        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{m.summary}</p>
                        <span className="mt-3 inline-block text-sm font-semibold text-blue-700">
                          View exercises →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}

          {/* Deep muscles */}
          {(() => {
            const deep = filtered.filter((m) => m.layer === "deep");
            if (deep.length === 0) return null;
            return (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-slate-900">Deep muscles (rotator cuff)</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {deep.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/muscles/${m.id}`}
                        className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: m.color }} aria-hidden />
                        <span className="text-sm font-semibold text-slate-800">{m.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })()}
        </>
      )}
    </SearchFilter>
  );
}
