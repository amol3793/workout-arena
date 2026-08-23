/**
 * One-time generator: converts a curated subset of the RepDB free exercise
 * dataset (https://github.com/RepDB/exercise-dataset — free for commercial
 * in-app use with attribution, NOT redistributable as a dataset) into our typed
 * Exercise format. Output: src/data/generatedExercises.ts
 *
 * Only a subset (a curated selection per primary muscle) is embedded in-app —
 * this is "in-app use with attribution", not dataset redistribution. RepDB is
 * credited in-UI (per-exercise + footer) per its license.
 */
import { writeFileSync } from "node:fs";

const REPDB_URL = "https://raw.githubusercontent.com/RepDB/exercise-dataset/main/exercises.json";
const FEDB_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const src = await fetch(REPDB_URL).then((r) => {
  if (!r.ok) throw new Error(`RepDB fetch failed: ${r.status}`);
  return r.json();
});
const freeDb = await fetch(FEDB_URL).then((r) => {
  if (!r.ok) throw new Error(`free-exercise-db fetch failed: ${r.status}`);
  return r.json();
});
const all = src.exercises;

function normalizeName(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
const freeDbByName = new Map();
for (const e of freeDb) {
  const key = normalizeName(e.name);
  if (!freeDbByName.has(key)) freeDbByName.set(key, e);
}

// RepDB snake_case primary muscle -> canonical kebab-case id (matches data model)
// pectoralis_major splits by exercise name into upper/middle/lower chest.
const MUSCLE_MAP = {
  anterior_deltoid: "anterior-deltoid",
  lateral_deltoid: "lateral-deltoid",
  posterior_deltoid: "posterior-deltoid",
  trapezius: "trapezius",
  pectoralis_major: "pectoralis-major-sternal", // default = middle chest
  latissimus_dorsi: "latissimus-dorsi",
  rhomboids: "rhomboids",
  erector_spinae: "erector-spinae",
  biceps_brachii: "biceps-brachii",
  brachialis: "brachialis",
  triceps_brachii: "triceps-brachii",
  brachioradialis: "brachioradialis",
  forearm_flexors: "forearm-flexors",
  forearm_extensors: "forearm-extensors",
  rectus_abdominis: "rectus-abdominis",
  obliques: "obliques",
  transverse_abdominis: "transverse-abdominis",
  gluteus_maximus: "gluteus-maximus",
  gluteus_medius: "gluteus-medius",
  quadriceps: "quadriceps",
  hamstrings: "hamstrings",
  adductors: "adductors",
  gastrocnemius: "gastrocnemius",
  soleus: "soleus",
};

// Exclude exercises that are stretches (no load) from auto-catalog
const EXCLUDE_TAGS = new Set(["stretch", "warmup", "cooldown"]);
const EXCLUDE_NAME = /stretch|roll|breathe|breathing|dead hang/i;

const EQUIP_LABEL = {
  dumbbell: "Dumbbells", barbell: "Barbell", cable: "Cable", kettlebell: "Kettlebell",
  machine: "Machine", resistance_band: "Resistance band", flat_bench: "Bench",
  pull_up_bar: "Pull-up bar", ez_bar: "EZ bar", decline_bench: "Decline bench",
  chest_fly_machine: "Fly machine", leg_press: "Leg press", leg_curl: "Leg curl machine",
  leg_extension: "Leg extension machine", ab_crunch_machine: "Ab machine",
  bicep_curl_machine: "Bicep curl machine", chest_press_machine: "Chest press machine",
  shoulder_press_machine: "Shoulder press machine", dip_station: "Dip station",
  dip_machine: "Dip machine", hack_squat: "Hack squat", zig_zag_bar: "EZ bar",
  standing_calf_raise_machine: "Calf raise machine", assisted_pullup_machine: "Assisted pull-up machine",
  ab_wheel: "Ab wheel", air_bike: "Air bike", battle_rope: "Battle ropes",
  back_extension_machine: "Back extension", plyo_box: "Plyo box", trap_bar: "Trap bar",
  hip_abduction_machine: "Hip abduction machine", hip_adduction_machine: "Hip adduction machine",
  bodyweight: "Bodyweight",
};
const EQUIP_MAP = (e) => {
  if (!e || e === "") return ["Bodyweight"];
  return [EQUIP_LABEL[e] ?? e.replaceAll("_", " ")];
};

// Split pectoralis_major exercises by name into chest sections
function chestSection(name) {
  const n = name.toLowerCase();
  if (/incline/.test(n)) return "pectoralis-major-clavicular"; // upper chest
  if (/decline|chest dip|dips/.test(n)) return "pectoralis-major-costal"; // lower chest
  return "pectoralis-major-sternal"; // middle chest
}

// Curated (hand-written) exercises already cover these RepDB movements —
// exclude from the generated set to avoid duplicate movement cards; the
// curated entries instead receive repdbImageId for their RepDB frames.
const EXCLUDE_DUPES = new Set([
  "lateral-raise", "cable-lateral-raise", "dumbbell-front-raise",
  "dumbbell-shoulder-press", "push-press", "arnold-press", "face-pull",
  "dumbbell-reverse-fly", "cable-external-rotation",
]);

// Verified YMove free-video matches for RepDB exercises. Files are self-hosted
// in public/exercise-media/ (commercial embedding permitted; no library resale).
const YMOVE_VIDEO = {
  "squat": "squat",
  "bench-press": "bench-press",
  "deadlift": "deadlift",
  "hammer-curl": "hammer-curl",
  "machine-chest-fly": "machine-chest-fly",
  "tricep-pushdown": "tricep-pushdown",
  "leg-extension": "leg-extension",
  "hack-squat": "hack-squat",
  "leg-curl": "leg-curl",
};

const DIFF_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

// max exercises per primary muscle
const CAP = 5;

const picked = [];
const perMuscle = {};

for (const ex of all) {
  if (ex.category !== "strength") continue;
  if (EXCLUDE_NAME.test(ex.name_en)) continue;
  if (EXCLUDE_DUPES.has(ex.id)) continue;
  if ((ex.tags || []).some((t) => EXCLUDE_TAGS.has(t))) continue;
  let primary = (ex.primary_muscles || []).map((m) => {
    if (m === "pectoralis_major") return chestSection(ex.name_en);
    return MUSCLE_MAP[m];
  }).filter(Boolean);
  // dedupe identical mapped primaries
  primary = [...new Set(primary)];
  if (primary.length === 0) continue;
  // add the exercise as a candidate for EVERY primary muscle it trains
  for (const key of primary) {
    perMuscle[key] = perMuscle[key] || [];
    perMuscle[key].push(ex);
  }
}

// Canonical big movements that must always be included when present.
const PRIORITY_IDS = new Set([
  "bench-press", "incline-dumbbell-press", "squat", "leg-press", "lunge",
  "deadlift", "pull-up", "seated-cable-rows", "bicep-curl", "barbell-curl",
  "tricep-dips", "dips", "plank", "crunches", "leg-curl", "leg-extension",
  "hip-thrust", "push-up", "knee-push-ups", "good-morning",
  "romanian-deadlift", "hack-squat", "bulgarian-split-squat",
  "wide-grip-seated-cable-row",
]);

const pickedIds = new Set();
for (const [muscle, list] of Object.entries(perMuscle)) {
  // Spread across difficulty levels (2 beginner, 2 intermediate, 1 advanced)
  // so iconic lifts (bench press, squat, deadlift) aren't crowded out.
  list.sort((a, b) => a.name_en.localeCompare(b.name_en));
  // Priority movements first
  const priority = list.filter((e) => PRIORITY_IDS.has(e.id));
  const byDiff = { beginner: [], intermediate: [], advanced: [] };
  for (const ex of list)
    if (!priority.includes(ex)) (byDiff[ex.difficulty] ?? byDiff.intermediate).push(ex);
  const quota = { beginner: 2, intermediate: 2, advanced: 1 };
  const chosen = [...priority.slice(0, CAP)];
  for (const diff of ["beginner", "intermediate", "advanced"]) {
    if (chosen.length >= CAP) break;
    chosen.push(...byDiff[diff].slice(0, Math.min(quota[diff], CAP - chosen.length)));
  }
  // top up from the rest if a level was short
  if (chosen.length < CAP) {
    const rest = list.filter((e) => !chosen.includes(e));
    chosen.push(...rest.slice(0, CAP - chosen.length));
  }
  perMuscle[muscle].used = chosen.length;
  for (const ex of chosen) {
    if (pickedIds.has(ex.id)) continue; // dedupe across muscles
    pickedIds.add(ex.id);
    picked.push(ex);
  }
}

const out = picked.map((ex) => {
  const primary = [...new Set((ex.primary_muscles || []).map((m) =>
    m === "pectoralis_major" ? chestSection(ex.name_en) : MUSCLE_MAP[m],
  ).filter(Boolean))];
  const secondary = [...new Set((ex.secondary_muscles || []).map((m) =>
    m === "pectoralis_major" ? chestSection(ex.name_en) : MUSCLE_MAP[m],
  ).filter((m) => m && !primary.includes(m)))];
  const steps = ex.instructions_en || [];
  const keyCue = steps.length ? steps[0].replace(/\.$/, "") : ex.description_en || "";
  const freeMatch = freeDbByName.get(normalizeName(ex.name_en));
  return {
    id: ex.id,
    name: ex.name_en,
    primaryMuscles: primary,
    secondaryMuscles: secondary,
    difficulty: ex.difficulty || "intermediate",
    equipment: EQUIP_MAP(ex.equipment),
    summary: ex.description_en || "",
    keyCue,
    steps,
    tips: ex.tips_en || [],
    contentSource: "repdb",
    repdbImageId: ex.id,
    ...(freeMatch ? { externalMediaId: freeMatch.id } : {}),
    ...(YMOVE_VIDEO[ex.id]
      ? {
          video: {
            src: `/exercise-media/${YMOVE_VIDEO[ex.id]}.mp4`,
            poster: `/exercise-media/${YMOVE_VIDEO[ex.id]}.webp`,
          },
        }
      : {}),
  };
});

const ts = `/**
 * GENERATED by scripts/import-repdb.mjs — do not edit by hand.
 * Curated subset of the free RepDB exercise dataset.
 * License: free for commercial in-app use WITH ATTRIBUTION (https://repdb.co).
 * These individual exercises are embedded in-app; the dataset is not
 * redistributed as a standalone bundle (per RepDB data license).
 */
import type { Exercise } from "./types";

export const GENERATED_EXERCISES: Exercise[] = ${JSON.stringify(out, null, 2)};
`;

writeFileSync("src/data/generatedExercises.ts", ts);
const counts = Object.fromEntries(Object.entries(perMuscle).map(([k, v]) => [k, v.used]));
console.log("Generated", out.length, "exercises. Per-muscle:", JSON.stringify(counts, null, 1));
