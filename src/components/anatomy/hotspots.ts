import type { BodySide, CanonicalMuscleId, RegionId } from "@/lib/anatomy/types";

/**
 * Interactive overlay geometry for the realistic anatomy imagery (Option B:
 * realistic art + transparent interaction layer). Coordinates are percentages
 * of the body-image box and carry CANONICAL ids — the app never depends on raw
 * asset internals.
 */

/* ============ Full-body region hotspots (dot + leader line + label) ============ */

export interface RegionHotspot {
  region: RegionId;
  side: "left" | "right"; // edge label column
  label: string;
  x: number; // % of image width (dot sits on the region)
  y: number; // % of image height
  /** Explicit edge-label y keeps the two annotation columns aligned. */
  labelY: number;
}

export const BODY_REGION_HOTSPOTS: Record<BodySide, RegionHotspot[]> = {
  front: [
    { region: "shoulder", side: "left", label: "Shoulder", x: 32, y: 21, labelY: 18 },
    { region: "chest", side: "left", label: "Chest", x: 44, y: 28, labelY: 27 },
    { region: "biceps", side: "left", label: "Biceps", x: 24, y: 34, labelY: 36 },
    { region: "forearms", side: "left", label: "Forearms", x: 17, y: 46, labelY: 47 },
    { region: "core", side: "right", label: "Core", x: 50, y: 43, labelY: 43 },
    { region: "legs", side: "left", label: "Front thigh", x: 43, y: 67, labelY: 67 },
  ],
  back: [
    { region: "shoulder", side: "left", label: "Shoulder", x: 31, y: 23, labelY: 19 },
    { region: "back", side: "right", label: "Back", x: 50, y: 34, labelY: 34 },
    { region: "triceps", side: "left", label: "Triceps", x: 23, y: 35, labelY: 35 },
    { region: "glutes", side: "left", label: "Glutes", x: 43, y: 53, labelY: 53 },
    { region: "legs", side: "left", label: "Back thigh", x: 43, y: 69, labelY: 69 },
  ],
};

/* ============ Regional diagram dots (dedicated zoomed artwork) ============ */

/**
 * Each region has a dedicated, tightly-cropped anatomical diagram
 * (`public/anatomy/region-<id>.webp`) with color-coded muscles. Dot positions
 * were extracted automatically by pixel-detecting each color region's centroid
 * (bilateral muscles split into L/R dots), so dots sit exactly ON each muscle.
 * Each dot draws a STRAIGHT leader line to a text label at the nearest edge.
 */
export interface DiagramDot {
  id: CanonicalMuscleId;
  x: number;
  y: number;
  /** label edge: which side of the image the label goes to */
  edge: "left" | "right";
}

export interface RegionDiagram {
  image: string; // path without extension
  aspect: string; // tailwind aspect class
  dots: DiagramDot[];
}

export const REGION_DIAGRAMS: Partial<Record<RegionId, RegionDiagram>> = {
  chest: {
    image: "/anatomy/region-chest.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "pectoralis-major-clavicular", x: 49.5, y: 23.8, edge: "left" },
      { id: "pectoralis-major-sternal", x: 49.6, y: 46.4, edge: "left" },
      { id: "pectoralis-major-costal", x: 48.3, y: 67.7, edge: "left" },
    ],
  },
  back: {
    image: "/anatomy/region-back.webp",
    aspect: "aspect-[2/3]",
    dots: [
      { id: "latissimus-dorsi", x: 29.7, y: 58.8, edge: "left" },
      { id: "latissimus-dorsi", x: 69.7, y: 58.8, edge: "right" },
      { id: "rhomboids", x: 49.7, y: 34.4, edge: "left" },
      { id: "erector-spinae", x: 49.9, y: 70.6, edge: "left" },
    ],
  },
  biceps: {
    image: "/anatomy/region-arms.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "biceps-brachii", x: 23.8, y: 48.3, edge: "left" },
      { id: "biceps-brachii", x: 30.5, y: 40.5, edge: "left" },
      { id: "brachialis", x: 29.3, y: 50.1, edge: "left" },
    ],
  },
  triceps: {
    image: "/anatomy/region-arms.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "triceps-brachii", x: 64.6, y: 49.4, edge: "right" },
      { id: "triceps-brachii", x: 72.5, y: 54, edge: "right" },
    ],
  },
  forearms: {
    image: "/anatomy/region-forearms.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "brachioradialis", x: 24.4, y: 39.6, edge: "left" },
      { id: "forearm-flexors", x: 30.3, y: 47.4, edge: "left" },
      { id: "forearm-extensors", x: 70.5, y: 47.9, edge: "right" },
    ],
  },
  core: {
    image: "/anatomy/region-core.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "rectus-abdominis", x: 49.8, y: 36.1, edge: "left" },
      { id: "obliques", x: 27.1, y: 39, edge: "left" },
      { id: "obliques", x: 72.2, y: 39.3, edge: "right" },
      { id: "transverse-abdominis", x: 50.4, y: 77.1, edge: "right" },
    ],
  },
  glutes: {
    image: "/anatomy/region-glutes.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "gluteus-medius", x: 27.3, y: 18.2, edge: "left" },
      { id: "gluteus-medius", x: 72.4, y: 18.9, edge: "right" },
      { id: "gluteus-maximus", x: 34.9, y: 58.9, edge: "left" },
      { id: "gluteus-maximus", x: 64.4, y: 59.2, edge: "right" },
    ],
  },
  legs: {
    image: "/anatomy/region-legs.webp",
    aspect: "aspect-[3/2]",
    dots: [
      { id: "quadriceps", x: 17.9, y: 32.5, edge: "left" },
      { id: "quadriceps", x: 34.6, y: 35.3, edge: "left" },
      { id: "adductors", x: 29.6, y: 25.2, edge: "left" },
      { id: "hamstrings", x: 65.2, y: 34.7, edge: "right" },
      { id: "hamstrings", x: 80.7, y: 34.9, edge: "right" },
      { id: "gastrocnemius", x: 64.7, y: 66.6, edge: "right" },
      { id: "gastrocnemius", x: 81.1, y: 66.8, edge: "right" },
      { id: "soleus", x: 64, y: 85.6, edge: "right" },
      { id: "soleus", x: 81, y: 86.2, edge: "right" },
    ],
  },
};

/* ============ Shoulder diagram (deltoid heads) ============ */

export interface DeltoidHotspot {
  id: CanonicalMuscleId;
  x: number;
  y: number;
  r: number;
}

/** Positions detected from the color-coded deltoid diagram (tight crop). */
export const DELTOID_HOTSPOTS: DeltoidHotspot[] = [
  { id: "anterior-deltoid", x: 29, y: 39, r: 15 },
  { id: "lateral-deltoid", x: 55, y: 34, r: 15 },
  { id: "posterior-deltoid", x: 77, y: 41, r: 14 },
];
