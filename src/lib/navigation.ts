import type { CanonicalMuscleId, RegionId } from "@/lib/anatomy/types";

/** Canonical deep link back into the interactive anatomy state. */
export function explorerUrl(
  region: RegionId,
  muscle?: CanonicalMuscleId | null,
): string {
  const params = new URLSearchParams({ region });
  if (muscle) params.set("muscle", muscle);
  return `/?${params.toString()}#explorer`;
}
