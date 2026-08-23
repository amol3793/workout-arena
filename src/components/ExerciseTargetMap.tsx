import { getMuscle } from "@/data";
import type { Exercise } from "@/data/types";
import { isDataSourceEnabled } from "@/lib/productConfig";
import { muscleMapAdapter } from "@/lib/target-map";

/**
 * Exercise-aware vector muscle map. Geometry is adapted from MuscleMap (MIT)
 * through openGym's published path conversion; see ASSET_LICENSING.md.
 */
export function ExerciseTargetMap({ exercise }: { exercise: Exercise }) {
  const primary = muscleMapAdapter.targetsFor(exercise.primaryMuscles);
  const secondary = muscleMapAdapter.targetsFor(exercise.secondaryMuscles);
  const body = muscleMapAdapter.paths.male;

  if (!isDataSourceEnabled("muscleMap")) {
    return (
      <div className="grid h-full w-full place-items-center bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">Target map is unavailable in this configuration.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3" role="img" aria-label={`Front and back muscle map showing muscles targeted by ${exercise.name}`}>
        {(["front", "back"] as const).map((side) => {
          const view = body[side];
          return (
            <div key={side} className="relative min-h-0 overflow-hidden rounded-xl bg-slate-100">
              <svg className="h-full w-full" viewBox={view.vb} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                {Object.entries(view.p).flatMap(([muscle, paths]) =>
                  paths.map((path, index) => {
                    const isPrimary = primary.has(muscle);
                    const isSecondary = !isPrimary && secondary.has(muscle);
                    return (
                      <path
                        key={`${muscle}-${index}`}
                        d={path}
                        className="stroke-white stroke-[2.5] [stroke-linejoin:round]"
                        fill={isPrimary ? "#ef4444" : isSecondary ? "#f59e0b" : "#dbe3ee"}
                      />
                    );
                  }),
                )}
              </svg>
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold capitalize text-white">{side}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
        {exercise.primaryMuscles.map((id) => <Legend key={id} id={id} label="primary" color="#ef4444" />)}
        {exercise.secondaryMuscles.slice(0, 3).map((id) => <Legend key={id} id={id} label="secondary" color="#f59e0b" />)}
      </div>
    </div>
  );
}

function Legend({ id, label, color }: { id: Exercise["primaryMuscles"][number]; label: string; color: string }) {
  const muscle = getMuscle(id);
  return <span className={`inline-flex items-center gap-1.5 ${label === "primary" ? "font-semibold text-slate-700" : "text-slate-500"}`}><span className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: color }} />{muscle?.shortName ?? id} · {label}</span>;
}
