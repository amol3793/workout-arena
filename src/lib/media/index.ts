import type { Exercise, MediaDescriptor } from "@/data/types";

/**
 * Media provider abstraction — resolves the best available media per exercise.
 *
 * Priority (layeredProvider):
 *   1. Real-human HD VIDEO (YMove, self-hosted, royalty-free).
 *   2. Real-human PHOTO sequence (free-exercise-db, PUBLIC DOMAIN).
 *   3. ILLUSTRATED frames (RepDB, free w/ attribution — credited in-UI).
 *   4. Self-authored SVG FIGURE (license-clean diagram fallback).
 *
 * Note: the "Free Exercise DB with videos" variant is NOT used — unverified
 * video provenance. Only the public-domain image dataset is used.
 */
export interface MediaProvider {
  id: string;
  resolve: (exercise: Exercise) => MediaDescriptor;
}

const FREE_EXERCISE_DB_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const REPDB_BASE =
  "https://raw.githubusercontent.com/RepDB/exercise-dataset/main/images/flat";

export const svgFigureProvider: MediaProvider = {
  id: "svg-figure",
  resolve: (exercise) => ({
    type: "svg-figure",
    provider: "svg-figure",
    alt: `Illustration demonstrating the ${exercise.name} movement`,
    license: "Project-owned (original work)",
    attribution: "Ease your Workout",
    figure: exercise.figure ?? "generic",
  }),
};

export const ymoveVideoProvider: MediaProvider = {
  id: "ymove-video",
  resolve: (exercise) => {
    if (!exercise.video) return svgFigureProvider.resolve(exercise);
    return {
      type: "video",
      provider: "ymove-video",
      src: exercise.video.src,
      poster: exercise.video.poster,
      alt: `Video demonstration of the ${exercise.name}`,
      license: "YMove free library — royalty-free for commercial use",
      attribution: "YMove (ymove.app)",
      credit: "Video: YMove",
      sourceUrl: "https://ymove.app/free-exercise-videos",
      figure: exercise.figure,
    };
  },
};

export const freeExerciseDbProvider: MediaProvider = {
  id: "free-exercise-db",
  resolve: (exercise) => {
    if (!exercise.externalMediaId) return svgFigureProvider.resolve(exercise);
    const base = `${FREE_EXERCISE_DB_BASE}/${exercise.externalMediaId}`;
    return {
      type: "image-sequence",
      provider: "free-exercise-db",
      frames: [`${base}/0.jpg`, `${base}/1.jpg`],
      alt: `Photo demonstration of the ${exercise.name}`,
      license: "Public Domain (Unlicense)",
      attribution: "free-exercise-db",
      credit: "Photo: free-exercise-db",
      sourceUrl: "https://github.com/yuhonas/free-exercise-db",
      figure: exercise.figure,
    };
  },
};

/** RepDB flat-illustrated start/peak frames — requires attribution (credited). */
export const repDbProvider: MediaProvider = {
  id: "repdb",
  resolve: (exercise) => {
    if (!exercise.repdbImageId) return svgFigureProvider.resolve(exercise);
    return {
      type: "image-sequence",
      provider: "repdb",
      frames: [
        `${REPDB_BASE}/${exercise.repdbImageId}-start.webp`,
        `${REPDB_BASE}/${exercise.repdbImageId}-peak.webp`,
      ],
      alt: `Illustrated demonstration of the ${exercise.name}`,
      license: "Free for commercial in-app use with attribution (RepDB free tier)",
      attribution: "RepDB",
      credit: "Illustration: RepDB",
      sourceUrl: "https://repdb.co/",
      figure: exercise.figure,
    };
  },
};

/** OpenGym animated GIF demos (© Gym visual — attribution required, 180×180). */
export const openGymProvider: MediaProvider = {
  id: "opengym",
  resolve: (exercise) => {
    if (!exercise.openGymGif) return svgFigureProvider.resolve(exercise);
    return {
      type: "gif",
      provider: "opengym",
      src: exercise.openGymGif,
      alt: `Animated demonstration of ${exercise.name}`,
      license: "© Gym visual — used with attribution per dataset NOTICE",
      attribution: exercise.openGymAttribution ?? "© Gym visual — gymvisual.com",
      credit: "© Gym visual",
      sourceUrl: "https://gymvisual.com/",
      figure: exercise.figure,
    };
  },
};

export const layeredProvider: MediaProvider = {
  id: "layered",
  resolve: (exercise) => {
    if (exercise.video) return ymoveVideoProvider.resolve(exercise);
    if (exercise.externalMediaId) return freeExerciseDbProvider.resolve(exercise);
    if (exercise.repdbImageId) return repDbProvider.resolve(exercise);
    if (exercise.openGymGif) return openGymProvider.resolve(exercise);
    return svgFigureProvider.resolve(exercise);
  },
};

let activeProvider: MediaProvider = layeredProvider;

export function setMediaProvider(provider: MediaProvider): void {
  activeProvider = provider;
}

export function resolveExerciseMedia(exercise: Exercise): MediaDescriptor {
  try {
    return activeProvider.resolve(exercise);
  } catch {
    return svgFigureProvider.resolve(exercise);
  }
}
