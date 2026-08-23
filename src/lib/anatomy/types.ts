/**
 * Canonical anatomy identifiers — the single source of truth.
 *
 * The visual asset (images/SVG now, 3D later) must NEVER be the source of truth.
 * Every hotspot / SVG element id / 3D mesh name maps to one of these canonical ids.
 */

export type RegionId =
  | "shoulder"
  | "chest"
  | "back"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "glutes"
  | "legs";

export type CanonicalMuscleId =
  // shoulder
  | "anterior-deltoid"
  | "lateral-deltoid"
  | "posterior-deltoid"
  | "trapezius"
  | "supraspinatus"
  | "infraspinatus"
  | "teres-minor"
  | "teres-major"
  | "subscapularis"
  // chest (pec major sections)
  | "pectoralis-major-clavicular"
  | "pectoralis-major-sternal"
  | "pectoralis-major-costal"
  // back
  | "latissimus-dorsi"
  | "rhomboids"
  | "erector-spinae"
  // arms
  | "biceps-brachii"
  | "brachialis"
  | "triceps-brachii"
  | "brachioradialis"
  | "forearm-flexors"
  | "forearm-extensors"
  // core
  | "rectus-abdominis"
  | "obliques"
  | "transverse-abdominis"
  // glutes
  | "gluteus-maximus"
  | "gluteus-medius"
  // legs
  | "quadriceps"
  | "hamstrings"
  | "adductors"
  | "gastrocnemius"
  | "soleus";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ShoulderView = "anterior" | "lateral" | "posterior";
export type BodySide = "front" | "back";

/**
 * Contract shared by all anatomy renderers (image+overlay now, 3D later).
 * A future 3D renderer implements the same callbacks against the same
 * canonical ids, so product/data/UI never change.
 */
export interface AnatomyRendererProps {
  selectedId?: CanonicalMuscleId | null;
  highlightedId?: CanonicalMuscleId | null;
  onSelect?: (id: CanonicalMuscleId | RegionId) => void;
  onHighlight?: (id: CanonicalMuscleId | RegionId | null) => void;
}
