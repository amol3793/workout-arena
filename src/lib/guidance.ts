import type { Exercise } from "@/data/types";

export interface FormGuidance {
  dos: string[];
  mistakes: string[];
  source: { label: string; url?: string };
}

const RULES: { match: RegExp; mistakes: string[] }[] = [
  {
    match: /lateral raise|front raise|upright row/i,
    mistakes: [
      "Swinging the weight or leaning back instead of moving under control.",
      "Shrugging the shoulders toward the ears and letting the traps take over.",
    ],
  },
  {
    match: /overhead press|shoulder press|military press|push press|arnold press|handstand push/i,
    mistakes: [
      "Overarching the lower back or letting the ribs flare instead of bracing the trunk.",
      "Letting the wrists fold back or finishing the weight in front of the body.",
    ],
  },
  {
    match: /reverse fly|rear delt|face pull|bench pull/i,
    mistakes: [
      "Shrugging the shoulders or using momentum instead of moving from the rear shoulder and upper back.",
      "Turning the movement into a low-elbow row and losing the intended rear-delt path.",
    ],
  },
  {
    match: /external rotation|internal rotation/i,
    mistakes: [
      "Allowing the elbow to drift away from the side instead of rotating at the shoulder.",
      "Using too much resistance and shortening the controlled range.",
    ],
  },
  {
    match: /bench press|chest press|push-up|push up|fly|dips?/i,
    mistakes: [
      "Letting the shoulders roll forward or the elbows flare beyond a controllable position.",
      "Bouncing, dropping, or rushing through the bottom of the repetition.",
    ],
  },
  {
    match: /squat|lunge|leg press|bulgarian/i,
    mistakes: [
      "Letting the knees collapse inward instead of tracking with the toes.",
      "Losing foot pressure or trunk tension to reach a depth you cannot control.",
    ],
  },
  {
    match: /deadlift|romanian|good morning|hip thrust|back extension/i,
    mistakes: [
      "Rounding the lower back instead of keeping the trunk braced through the hip hinge.",
      "Letting the load drift away from the body or overextending the spine at lockout.",
    ],
  },
  {
    match: /curl/i,
    mistakes: [
      "Swinging the torso or driving the elbows forward to move a weight that is too heavy.",
      "Letting the wrists bend instead of keeping them stacked with the forearms.",
    ],
  },
  {
    match: /tricep|pushdown|skull crusher|extension/i,
    mistakes: [
      "Moving the upper arms instead of keeping the motion focused at the elbows.",
      "Using body momentum or letting the shoulders roll forward under load.",
    ],
  },
  {
    match: /row|pull-up|pull up|pulldown|pullover/i,
    mistakes: [
      "Shrugging toward the ears instead of setting the shoulder blades before pulling.",
      "Jerking with the torso or cutting the range short to move more weight.",
    ],
  },
  {
    match: /plank|dead bug|bird dog|crunch|twist|woodchop|side bend|knee raise/i,
    mistakes: [
      "Letting the hips sag, rotate, or move before the trunk is braced.",
      "Holding the breath instead of maintaining controlled breathing and tension.",
    ],
  },
  {
    match: /calf raise/i,
    mistakes: [
      "Bouncing through the repetition instead of pausing and controlling the ankle.",
      "Using only a short range and skipping the stretch or full contraction.",
    ],
  },
  {
    match: /leg curl|leg extension/i,
    mistakes: [
      "Lifting the hips or shifting on the pad instead of keeping the body fixed.",
      "Kicking the weight or letting the stack slam between repetitions.",
    ],
  },
  {
    match: /abduction|adduction|clamshell/i,
    mistakes: [
      "Rotating or leaning the torso to create range instead of moving from the hip.",
      "Using momentum and losing control at the end of the range.",
    ],
  },
];

export function getFormGuidance(exercise: Exercise): FormGuidance {
  const dos = [...exercise.tips];
  const candidates = [exercise.keyCue, ...exercise.steps].filter(Boolean);
  for (const cue of candidates) {
    if (dos.length >= 3) break;
    if (!dos.some((item) => item.toLowerCase() === cue.toLowerCase())) dos.push(cue);
  }

  const rule = RULES.find((item) => item.match.test(`${exercise.name} ${exercise.id}`));
  const mistakes = rule?.mistakes ?? [
    "Using momentum or a load that changes the intended movement path.",
    "Rushing the lowering phase instead of keeping the repetition controlled.",
  ];

  return {
    dos: dos.slice(0, 3),
    mistakes,
    source:
      exercise.contentSource === "repdb" && exercise.repdbImageId
        ? {
            label: "RepDB exercise instructions and tips",
            url: `https://exercise-dataset.com/exercise/${exercise.repdbImageId}/`,
          }
        : { label: "Ease your Workout editorial form guidance" },
  };
}
