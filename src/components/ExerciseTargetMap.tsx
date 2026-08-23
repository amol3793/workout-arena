import { getMuscle } from "@/data";
import type { Exercise } from "@/data/types";
import type { BodySide, CanonicalMuscleId } from "@/lib/anatomy/types";

interface Point {
  side: BodySide;
  x: number;
  y: number;
}

/** Anatomically mapped positions on the realistic full-body front/back images. */
const POINTS: Partial<Record<CanonicalMuscleId, Point[]>> = {
  "anterior-deltoid": [{ side: "front", x: 32, y: 21 }, { side: "front", x: 68, y: 21 }],
  "lateral-deltoid": [{ side: "front", x: 29, y: 23 }, { side: "front", x: 71, y: 23 }],
  "posterior-deltoid": [{ side: "back", x: 31, y: 23 }, { side: "back", x: 69, y: 23 }],
  trapezius: [{ side: "back", x: 50, y: 23 }],
  supraspinatus: [{ side: "back", x: 42, y: 25 }, { side: "back", x: 58, y: 25 }],
  infraspinatus: [{ side: "back", x: 41, y: 29 }, { side: "back", x: 59, y: 29 }],
  "teres-minor": [{ side: "back", x: 37, y: 31 }, { side: "back", x: 63, y: 31 }],
  "teres-major": [{ side: "back", x: 36, y: 34 }, { side: "back", x: 64, y: 34 }],
  subscapularis: [{ side: "front", x: 37, y: 25 }, { side: "front", x: 63, y: 25 }],
  "pectoralis-major-clavicular": [{ side: "front", x: 50, y: 24 }],
  "pectoralis-major-sternal": [{ side: "front", x: 50, y: 28 }],
  "pectoralis-major-costal": [{ side: "front", x: 50, y: 32 }],
  "latissimus-dorsi": [{ side: "back", x: 37, y: 36 }, { side: "back", x: 63, y: 36 }],
  rhomboids: [{ side: "back", x: 50, y: 29 }],
  "erector-spinae": [{ side: "back", x: 50, y: 43 }],
  "biceps-brachii": [{ side: "front", x: 23, y: 39 }, { side: "front", x: 77, y: 39 }],
  brachialis: [{ side: "front", x: 21, y: 43 }, { side: "front", x: 79, y: 43 }],
  "triceps-brachii": [{ side: "back", x: 23, y: 36 }, { side: "back", x: 77, y: 36 }],
  brachioradialis: [{ side: "front", x: 18, y: 45 }, { side: "front", x: 82, y: 45 }],
  "forearm-flexors": [{ side: "front", x: 17, y: 49 }, { side: "front", x: 83, y: 49 }],
  "forearm-extensors": [{ side: "back", x: 17, y: 48 }, { side: "back", x: 83, y: 48 }],
  "rectus-abdominis": [{ side: "front", x: 50, y: 45 }],
  obliques: [{ side: "front", x: 39, y: 47 }, { side: "front", x: 61, y: 47 }],
  "transverse-abdominis": [{ side: "front", x: 50, y: 51 }],
  "gluteus-maximus": [{ side: "back", x: 43, y: 54 }, { side: "back", x: 57, y: 54 }],
  "gluteus-medius": [{ side: "back", x: 36, y: 49 }, { side: "back", x: 64, y: 49 }],
  quadriceps: [{ side: "front", x: 43, y: 67 }, { side: "front", x: 57, y: 67 }],
  hamstrings: [{ side: "back", x: 43, y: 68 }, { side: "back", x: 57, y: 68 }],
  adductors: [{ side: "front", x: 50, y: 63 }],
  gastrocnemius: [{ side: "back", x: 43, y: 83 }, { side: "back", x: 57, y: 83 }],
  soleus: [{ side: "back", x: 43, y: 88 }, { side: "back", x: 57, y: 88 }],
};

export function ExerciseTargetMap({ exercise }: { exercise: Exercise }) {
  const targetIds = [...exercise.primaryMuscles, ...exercise.secondaryMuscles];

  return (
    <div className="flex h-full w-full flex-col bg-gradient-to-b from-slate-50 to-white p-3 sm:p-4">
      <div className="min-h-0 flex-1 grid grid-cols-2 gap-3">
        {(["front", "back"] as BodySide[]).map((side) => (
          <div key={side} className="relative min-h-0 overflow-hidden rounded-xl bg-slate-100">
            <img
              src={`/anatomy/body-${side}.webp`}
              alt={`${side} anatomy showing muscles targeted by ${exercise.name}`}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            {targetIds.flatMap((id) =>
              (POINTS[id] ?? [])
                .filter((p) => p.side === side)
                .map((p, i) => {
                  const primary = exercise.primaryMuscles.includes(id);
                  const muscle = getMuscle(id);
                  return (
                    <span
                      key={`${id}-${i}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white shadow-lg"
                      style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: primary ? 19 : 13,
                        height: primary ? 19 : 13,
                        backgroundColor: muscle?.color ?? (primary ? "#ef4444" : "#f59e0b"),
                        boxShadow: primary
                          ? `0 0 0 4px color-mix(in srgb, ${muscle?.color ?? "#ef4444"} 30%, transparent)`
                          : undefined,
                      }}
                      title={`${muscle?.name ?? id} — ${primary ? "primary" : "secondary"}`}
                    />
                  );
                }),
            )}
            <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[10px] font-semibold capitalize text-white">
              {side}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
        {exercise.primaryMuscles.map((id) => {
          const m = getMuscle(id);
          return (
            <span key={id} className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full ring-1 ring-white" style={{ backgroundColor: m?.color }} />
              {m?.shortName ?? id} · primary
            </span>
          );
        })}
        {exercise.secondaryMuscles.slice(0, 3).map((id) => {
          const m = getMuscle(id);
          return (
            <span key={id} className="inline-flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m?.color }} />
              {m?.shortName ?? id} · secondary
            </span>
          );
        })}
      </div>
    </div>
  );
}
