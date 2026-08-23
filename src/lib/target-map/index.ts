import type { CanonicalMuscleId } from "@/lib/anatomy/types";
import muscleMapPaths from "./muscleMapPaths";

export type TargetMapAdapter = {
  id: string;
  paths: typeof muscleMapPaths;
  targetsFor: (muscles: CanonicalMuscleId[]) => Set<string>;
};

const TARGETS: Partial<Record<CanonicalMuscleId, string[]>> = {
  "anterior-deltoid": ["deltoids"], "lateral-deltoid": ["deltoids"], "posterior-deltoid": ["deltoids"],
  trapezius: ["trapezius"], supraspinatus: ["deltoids"], infraspinatus: ["upper-back"],
  "teres-minor": ["upper-back"], "teres-major": ["upper-back"], subscapularis: ["deltoids"],
  "pectoralis-major-clavicular": ["chest"], "pectoralis-major-sternal": ["chest"], "pectoralis-major-costal": ["chest"],
  "latissimus-dorsi": ["upper-back"], rhomboids: ["upper-back"], "erector-spinae": ["lower-back"],
  "biceps-brachii": ["biceps"], brachialis: ["biceps"], "triceps-brachii": ["triceps"],
  brachioradialis: ["forearm"], "forearm-flexors": ["forearm"], "forearm-extensors": ["forearm"],
  "rectus-abdominis": ["abs"], obliques: ["obliques"], "transverse-abdominis": ["abs"],
  "gluteus-maximus": ["gluteal"], "gluteus-medius": ["gluteal"], quadriceps: ["quadriceps"],
  hamstrings: ["hamstring"], adductors: ["adductors"], gastrocnemius: ["calves"], soleus: ["calves"],
};

export const muscleMapAdapter: TargetMapAdapter = {
  id: "muscle-map-mit",
  paths: muscleMapPaths,
  targetsFor: (muscles) => new Set(muscles.flatMap((muscle) => TARGETS[muscle] ?? [])),
};
