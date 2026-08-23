"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getInteractiveMuscles,
  getMuscle,
  getPrimaryExercisesForMuscle,
  getRegion,
  REGIONS,
} from "@/data";
import type { BodySide, CanonicalMuscleId, RegionId } from "@/lib/anatomy/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ExerciseMedia } from "./ExerciseMedia";
import { FullBodyViewer } from "./anatomy/FullBodyViewer";
import { RegionDiagramViewer } from "./anatomy/RegionDiagramViewer";
import { ShoulderViewer } from "./anatomy/ShoulderViewer";
import { MuscleInfo } from "./MuscleInfo";

type CurrentView = "body" | RegionId;

const AVAILABLE = REGIONS.filter((r) => r.status === "available");

export function Explorer() {
  const reduced = useReducedMotion();
  const [view, setView] = useState<CurrentView>("body");
  const [side, setSide] = useState<BodySide>("front");
  const [selected, setSelected] = useState<CanonicalMuscleId | null>(null);
  const [highlight, setHighlight] = useState<CanonicalMuscleId | null>(null);

  const selectedMuscle = selected ? getMuscle(selected) : undefined;
  const region = view !== "body" ? getRegion(view) : undefined;

  // Restore a contextual anatomy state from links such as
  // /?region=chest&muscle=pectoralis-major-clavicular#explorer.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedRegion = params.get("region");
    const requestedMuscle = params.get("muscle");
    const restoredRegion = requestedRegion ? getRegion(requestedRegion) : undefined;
    const restoredMuscle = requestedMuscle ? getMuscle(requestedMuscle) : undefined;
    if (!restoredRegion) return;

    setView(restoredRegion.id as RegionId);
    setSide(restoredRegion.view);
    if (restoredMuscle?.region === restoredRegion.id) {
      setSelected(restoredMuscle.id);
    }
  }, []);

  function openRegion(id: RegionId) {
    setView(id);
    setSelected(null);
    setHighlight(null);
    const r = getRegion(id);
    if (r?.view === "back") setSide("back");
    if (r?.view === "front") setSide("front");
  }
  function backToBody() {
    setView("body");
    setSelected(null);
    setHighlight(null);
  }

  const zoomed = view !== "body";

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[210px_minmax(0,1fr)_340px] lg:items-start">
      {/* ── LEFT: region navigation ── */}
      <aside className="order-2 lg:order-1">
        <div className="hidden rounded-2xl bg-white p-3 ring-1 ring-slate-200 lg:block">
          <h2 className="flex items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Body regions
            {!zoomed && <span className="font-normal normal-case tracking-normal text-slate-400">tap a dot too</span>}
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={backToBody}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  !zoomed ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Full Body
              </button>
            </li>
            {AVAILABLE.map((r) => {
              const active = view === r.id;
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => openRegion(r.id as RegionId)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    {r.name}
                    <span className="text-[10px] opacity-70">{r.muscleIds.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mobile: compact region chips (body view) */}
        {!zoomed && (
          <div className="flex flex-wrap items-center gap-2 lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pick a region:</span>
            {AVAILABLE.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => openRegion(r.id as RegionId)}
                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 transition hover:bg-blue-100"
              >
                {r.name} →
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── CENTER: anatomy viewer ── */}
      <div className="order-1 lg:order-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white p-3 ring-1 ring-slate-200 sm:p-4">
          {/* Controls bar */}
          <div className="mb-2 flex items-center justify-between gap-2">
            {zoomed ? (
              <button
                type="button"
                onClick={backToBody}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ← Full body
              </button>
            ) : (
              <span className="text-sm font-medium text-slate-500">Full body</span>
            )}

            {!zoomed && (
              <div className="inline-flex rounded-full bg-slate-100 p-0.5 sm:p-1" role="tablist" aria-label="Body view">
                {(["front", "back"] as BodySide[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    role="tab"
                    aria-selected={side === s}
                    onClick={() => setSide(s)}
                    className={`rounded-full px-3.5 py-1 text-sm font-semibold capitalize transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-4 sm:py-1.5 ${
                      side === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {zoomed && (
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Zoomed view
              </span>
            )}
          </div>

          {/* Viewer */}
          <div className="relative mx-auto h-[440px] w-full max-w-md sm:h-[520px] lg:h-[540px]">
            <div
              className="absolute inset-0 grid place-items-center"
              style={{
                opacity: zoomed ? 0 : 1,
                transform: zoomed ? "scale(1.5)" : "scale(1)",
                pointerEvents: zoomed ? "none" : "auto",
                transition: reduced ? undefined : "opacity .4s ease, transform .4s ease",
              }}
              aria-hidden={zoomed}
            >
              <FullBodyViewer
                side={side}
                active={!zoomed}
                onSelectRegion={openRegion}
                reducedMotion={reduced}
              />
            </div>
            <div
              className="absolute inset-0 grid place-items-center"
              style={{
                opacity: zoomed ? 1 : 0,
                transform: zoomed ? "scale(1)" : "scale(0.8)",
                pointerEvents: zoomed ? "auto" : "none",
                transition: reduced ? undefined : "opacity .4s ease, transform .4s ease",
              }}
              aria-hidden={!zoomed}
            >
              {view === "shoulder" ? (
                <ShoulderViewer
                  selectedId={selected}
                  highlightedId={highlight}
                  onSelect={(id) => setSelected(id as CanonicalMuscleId)}
                  onHighlight={setHighlight}
                  reducedMotion={reduced}
                  active={zoomed}
                />
              ) : region ? (
                <RegionDiagramViewer
                  key={region.id}
                  region={region.id as RegionId}
                  selectedId={selected}
                  highlightedId={highlight}
                  onSelect={(id) => setSelected(id as CanonicalMuscleId)}
                  onHighlight={setHighlight}
                  reducedMotion={reduced}
                  active={zoomed}
                />
              ) : null}
            </div>
          </div>

          {/* Region muscle chips */}
          {zoomed && region && region.id !== "shoulder" && (
            <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:mt-3 sm:gap-2">
              <span className="mr-1 hidden items-center text-xs font-semibold uppercase tracking-wide text-slate-400 sm:inline-flex">
                {region.name} muscles
              </span>
              {getInteractiveMuscles(region.id).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelected(m.id)}
                  onMouseEnter={() => setHighlight(m.id)}
                  onMouseLeave={() => setHighlight(null)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3 sm:py-1.5 sm:text-sm ${
                    selected === m.id
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5" style={{ backgroundColor: m.color }} aria-hidden />
                  {m.shortName}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: info panel (desktop) ── */}
      <aside className="order-3 hidden lg:block">
        <PanelContent
          view={view}
          selectedMuscleId={selected}
        />
      </aside>

      {/* ── MOBILE sheets ── */}
      {zoomed && selectedMuscle && (
        <div className="order-3 lg:hidden">
          <div className="rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-200 sm:p-5">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Close ✕
              </button>
            </div>
            <MuscleInfo muscle={selectedMuscle} />
            <BestExercises muscleId={selectedMuscle.id} />
          </div>
        </div>
      )}
    </div>
  );
}

function PanelContent({
  view,
  selectedMuscleId,
}: {
  view: CurrentView;
  selectedMuscleId: CanonicalMuscleId | null;
}) {
  const muscle = selectedMuscleId ? getMuscle(selectedMuscleId) : undefined;

  if (muscle) {
    return (
      <div className="sticky top-20 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <MuscleInfo muscle={muscle} />
        <BestExercises muscleId={muscle.id} />
      </div>
    );
  }

  if (view !== "body") {
    const r = getRegion(view)!;
    const muscles = getInteractiveMuscles(r.id);
    const surface = muscles.filter((m) => m.layer === "surface");
    const deep = muscles.filter((m) => m.layer === "deep");
    return (
      <div className="sticky top-20 rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h2 className="text-xl font-bold text-slate-900">{r.name} muscles</h2>
        <p className="mt-1 text-sm text-slate-600">{r.tagline}</p>

        <MuscleList title="Surface" muscles={surface} />
        {deep.length > 0 && <MuscleList title="Deep" muscles={deep} tint />}

        <Link
          href={`/muscles/${r.id}`}
          className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:underline"
        >
          Browse all {r.name.toLowerCase()} muscles →
        </Link>
      </div>
    );
  }

  return (
    <div className="sticky top-20 rounded-2xl bg-gradient-to-b from-blue-50 to-white p-6 text-center ring-1 ring-slate-200">
      <h2 className="mt-1 text-lg font-bold text-slate-900">Explore your muscles</h2>
      <p className="mt-2 text-sm text-slate-600">
        Tap a glowing marker on the body to zoom into a region and discover the
        muscles that move it — and the best exercises to train them.
      </p>
    </div>
  );
}

function MuscleList({
  title,
  muscles,
  tint,
}: {
  title: string;
  muscles: ReturnType<typeof getInteractiveMuscles>;
  tint?: boolean;
}) {
  if (muscles.length === 0) return null;
  return (
    <>
      <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <ul className="mt-2 space-y-1.5">
        {muscles.map((m) => (
          <li key={m.id} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left ${tint ? "bg-purple-50/60" : "bg-slate-50"}`}>
            <span className="h-3 w-3 rounded-full ring-2 ring-white" style={{ backgroundColor: m.color }} aria-hidden />
            <span className="text-sm font-medium text-slate-800">{m.name}</span>
            <span className={`ml-auto text-[11px] ${tint ? "text-purple-400" : "text-slate-400"}`}>{m.shortName}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function BestExercises({ muscleId }: { muscleId: CanonicalMuscleId }) {
  const exercises = getPrimaryExercisesForMuscle(muscleId).slice(0, 3);
  if (exercises.length === 0) {
    return (
      <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
        No isolation exercises yet — this muscle is trained as a supporting muscle.
      </p>
    );
  }
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Best exercises
      </h3>
      <ul className="space-y-2">
        {exercises.map((ex) => (
          <li key={ex.id}>
            <Link
              href={`/exercises/${ex.id}`}
              className="flex items-center gap-3 rounded-xl p-2 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-50">
                <ExerciseMedia exercise={ex} className="h-full w-full" animate={false} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-800">{ex.name}</span>
                <span className="block text-xs capitalize text-slate-500">
                  {ex.difficulty} · {ex.equipment[0]}
                </span>
              </span>
              <span className="ml-auto text-slate-400" aria-hidden>→</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/muscles/${muscleId}`}
        className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
      >
        View all exercises →
      </Link>
    </div>
  );
}
