export const SITE = {
  name: "Ease your Workout",
  title: "Ease your Workout — Understand your muscles, discover exercises",
  description:
    "A free, interactive guide to the human muscular system. Explore the body, select a muscle, and discover the best exercises to train it — no account required.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://workout.easeur.com",
} as const;
