import type { Region } from "./types";

/**
 * All major body regions are interactive. Each region maps to the body image
 * (front/back) + overlay hotspots configured in src/components/anatomy/hotspots.ts.
 */
export const REGIONS: Region[] = [
  {
    id: "shoulder",
    name: "Shoulder",
    tagline: "The deltoids — the muscles that cap and move your shoulder.",
    status: "available",
    view: "front",
    muscleIds: [
      "anterior-deltoid",
      "lateral-deltoid",
      "posterior-deltoid",
      "trapezius",
      "supraspinatus",
      "infraspinatus",
      "teres-minor",
      "teres-major",
      "subscapularis",
    ],
  },
  {
    id: "chest",
    name: "Chest",
    tagline: "The pectoralis major — upper, middle and lower sections that power pushing.",
    status: "available",
    view: "front",
    muscleIds: [
      "pectoralis-major-clavicular",
      "pectoralis-major-sternal",
      "pectoralis-major-costal",
    ],
  },
  {
    id: "back",
    name: "Back",
    tagline: "Lats, rhomboids and spinal erectors — posture and pulling power.",
    status: "available",
    view: "back",
    muscleIds: ["latissimus-dorsi", "rhomboids", "erector-spinae"],
  },
  {
    id: "biceps",
    name: "Biceps",
    tagline: "The front of the upper arm — bends the elbow and lifts weight.",
    status: "available",
    view: "front",
    muscleIds: ["biceps-brachii", "brachialis"],
  },
  {
    id: "triceps",
    name: "Triceps",
    tagline: "The back of the upper arm — straightens the elbow for pressing.",
    status: "available",
    view: "back",
    muscleIds: ["triceps-brachii"],
  },
  {
    id: "forearms",
    name: "Forearms",
    tagline: "Grip, wrist and rotational strength from elbow to hand.",
    status: "available",
    view: "front",
    muscleIds: ["brachioradialis", "forearm-flexors", "forearm-extensors"],
  },
  {
    id: "core",
    name: "Core",
    tagline: "Abs and obliques — stabilize and brace everything you do.",
    status: "available",
    view: "front",
    muscleIds: ["rectus-abdominis", "obliques", "transverse-abdominis"],
  },
  {
    id: "glutes",
    name: "Glutes",
    tagline: "The buttocks — the biggest, strongest muscles in the body.",
    status: "available",
    view: "back",
    muscleIds: ["gluteus-maximus", "gluteus-medius"],
  },
  {
    id: "legs",
    name: "Legs",
    tagline: "Quads, hamstrings and calves — the engine of the lower body.",
    status: "available",
    view: "front",
    muscleIds: ["quadriceps", "hamstrings", "adductors", "gastrocnemius", "soleus"],
  },
];
