import type { CanonicalMuscleId, RegionId } from "@/lib/anatomy/types";
import { EXERCISES as CURATED_EXERCISES } from "./exercises";
import { GENERATED_EXERCISES } from "./generatedExercises";
import { MUSCLES } from "./muscles";
import { OPENGYM_EXERCISES } from "./openGymExercises";
import { REGIONS } from "./regions";
import type { Exercise, Muscle, Region } from "./types";

/**
 * Full exercise catalog merges three sources (priority order):
 *   1. Curated (hand-written, YMove video + free-exercise-db photos)
 *   2. RepDB generated (illustrations + instructions, attribution required)
 *   3. OpenGym dataset (1,295 exercises with GIF demos, © Gym visual attribution)
 * Duplicate ids are dropped, keeping the first occurrence.
 */
const EXERCISES: Exercise[] = (() => {
  const seen = new Set<string>();
  const all: Exercise[] = [];
  for (const e of [...CURATED_EXERCISES, ...GENERATED_EXERCISES, ...OPENGYM_EXERCISES]) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    all.push(e);
  }
  return all;
})();

export { EXERCISES, GENERATED_EXERCISES, MUSCLES, OPENGYM_EXERCISES, REGIONS };
export { CURATED_EXERCISES };
export type { Exercise, Muscle, Region };

const muscleById = new Map(MUSCLES.map((m) => [m.id, m]));
const exerciseById = new Map(EXERCISES.map((e) => [e.id, e]));
const regionById = new Map(REGIONS.map((r) => [r.id, r]));

export function getMuscle(id: string): Muscle | undefined {
  return muscleById.get(id as CanonicalMuscleId);
}

export function getExercise(id: string): Exercise | undefined {
  return exerciseById.get(id);
}

export function getRegion(id: string): Region | undefined {
  return regionById.get(id);
}

export function isRegion(id: string): boolean {
  return regionById.has(id);
}

export function isMuscle(id: string): boolean {
  return muscleById.has(id as CanonicalMuscleId);
}

export function getMusclesForRegion(regionId: RegionId | string): Muscle[] {
  return MUSCLES.filter((m) => m.region === regionId);
}

export function getInteractiveMuscles(regionId: RegionId | string): Muscle[] {
  return getMusclesForRegion(regionId).filter((m) => m.interactive);
}

export function getExercisesForMuscle(muscleId: string): Exercise[] {
  return EXERCISES.filter(
    (e) =>
      e.primaryMuscles.includes(muscleId as CanonicalMuscleId) ||
      e.secondaryMuscles.includes(muscleId as CanonicalMuscleId),
  );
}

export function getPrimaryExercisesForMuscle(muscleId: string): Exercise[] {
  return EXERCISES.filter((e) =>
    e.primaryMuscles.includes(muscleId as CanonicalMuscleId),
  );
}

export function getExercisesForRegion(regionId: RegionId | string): Exercise[] {
  const muscles = new Set(getMusclesForRegion(regionId).map((m) => m.id));
  const out: Exercise[] = [];
  const seen = new Set<string>();
  for (const e of EXERCISES) {
    if (e.primaryMuscles.some((id) => muscles.has(id)) && !seen.has(e.id)) {
      seen.add(e.id);
      out.push(e);
    }
  }
  return out;
}

export function muscleNames(ids: CanonicalMuscleId[]): string[] {
  return ids.map((id) => getMuscle(id)?.name ?? id);
}

export const AVAILABLE_REGIONS = REGIONS.filter((r) => r.status === "available");
