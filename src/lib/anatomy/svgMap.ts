import type { CanonicalMuscleId, RegionId } from "./types";

/**
 * Maps raw SVG element ids -> canonical application ids.
 *
 * The app depends on canonical ids, not on arbitrary SVG element names.
 * A future 3D renderer would provide its own map (e.g. `deltoid_lateral`
 * -> `lateral-deltoid`) without any other change to the application.
 */
const SVG_TO_CANONICAL: Record<string, CanonicalMuscleId | RegionId> = {
  // Full body
  "svg-region-shoulder": "shoulder",
  // Shoulder zoom view
  "svg-anterior-deltoid": "anterior-deltoid",
  "svg-lateral-deltoid": "lateral-deltoid",
  "svg-posterior-deltoid": "posterior-deltoid",
  "svg-trapezius": "trapezius",
};

export function svgIdToCanonical(
  svgId: string,
): CanonicalMuscleId | RegionId | null {
  return SVG_TO_CANONICAL[svgId] ?? null;
}

export function canonicalToSvgId(id: CanonicalMuscleId | RegionId): string {
  const entry = Object.entries(SVG_TO_CANONICAL).find(([, v]) => v === id);
  return entry ? entry[0] : `svg-${id}`;
}

export const SVG_MAP = SVG_TO_CANONICAL;
