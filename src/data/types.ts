import type {
  CanonicalMuscleId,
  Difficulty,
  RegionId,
  ShoulderView,
} from "@/lib/anatomy/types";

export interface Region {
  id: RegionId | string;
  name: string;
  tagline: string;
  /** "available" flows are fully interactive. */
  status: "available" | "coming-soon";
  /** Which body side this region is best explored from. */
  view: "front" | "back";
  muscleIds: CanonicalMuscleId[];
}

export interface Muscle {
  id: CanonicalMuscleId;
  name: string;
  shortName: string;
  region: RegionId;
  /** Which shoulder sub-view best shows this muscle (null for non-shoulder). */
  view: ShoulderView;
  /** Surface muscle vs deeper muscle. */
  layer: "surface" | "deep";
  summary: string;
  functions: string[];
  location: string;
  /** Accent color used in the anatomy + UI (paired with non-color cues). */
  color: string;
  /**
   * Optional curated exercise ids. The primary source of exercises is the
   * derived lookup (exercises whose primaryMuscles/secondaryMuscles include
   * this muscle). This field only adds curated overrides.
   */
  exerciseIds: string[];
  interactive: boolean;
}

export type MediaType = "svg-figure" | "gif" | "video" | "image" | "image-sequence";

export interface MediaDescriptor {
  type: MediaType;
  /** Which provider resolved this media. */
  provider: string;
  /** Optional single raster/video source (lazy-loaded). */
  src?: string;
  /** Optional poster image shown before a video plays. */
  poster?: string;
  /** Optional multi-frame sequence (start/end positions) to animate. */
  frames?: string[];
  /** Human-readable alt text. */
  alt: string;
  license: string;
  attribution: string;
  /** Short credit label shown in-UI. */
  credit?: string;
  /** Optional link back to the media source for attribution/credit. */
  sourceUrl?: string;
  /** Hint for the self-authored SVG figure fallback renderer. */
  figure?: ExerciseFigureKind;
}

/** Self-hosted real-human demonstration video (e.g. from YMove free library). */
export interface ExerciseVideo {
  src: string;
  poster: string;
}

export type ExerciseFigureKind =
  | "lateral-raise"
  | "front-raise"
  | "overhead-press"
  | "rear-fly"
  | "face-pull"
  | "external-rotation"
  | "generic";

export interface Exercise {
  id: string;
  name: string;
  primaryMuscles: CanonicalMuscleId[];
  secondaryMuscles: CanonicalMuscleId[];
  difficulty: Difficulty;
  equipment: string[];
  summary: string;
  keyCue: string;
  steps: string[];
  /** Positive form standards. RepDB-generated records preserve `tips_en`. */
  tips: string[];
  /** Where the written instructions/tips came from (media provenance is separate). */
  contentSource?: "repdb" | "editorial";
  /** Optional SVG figure hint; media is resolved via the MediaProvider. */
  figure?: ExerciseFigureKind;
  /** free-exercise-db (public domain) id → real-human two-frame photos. */
  externalMediaId?: string;
  /** Self-hosted YMove HD video (royalty-free, commercial use OK). */
  video?: ExerciseVideo;
  /** RepDB flat-illustration id → two illustrated frames (attribution required). */
  repdbImageId?: string;
  /** OpenGym dataset ID (hasaneyldrm/exercises-dataset, MIT data + © Gym visual media). */
  openGymId?: string;
  /** Direct URL to animated GIF demo (© Gym visual — attribution required). */
  openGymGif?: string | null;
  /** Direct URL to thumbnail image (© Gym visual — attribution required). */
  openGymImage?: string | null;
  /** Attribution text for the media (must be displayed when media is shown). */
  openGymAttribution?: string;
}
