import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EXERCISES } from "@/data";
import { ExercisesListClient } from "./ExercisesListClient";

export const metadata: Metadata = {
  title: "Exercises",
  description:
    "Browse strength exercises for every body region — with HD videos, real photos, illustrated steps and clear beginner-friendly instructions.",
  alternates: { canonical: "/exercises" },
};

export default function ExercisesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Exercises" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        Exercises
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {EXERCISES.length} exercises covering every major muscle group. Each includes
        a demonstration and step-by-step instructions.
      </p>
      <ExercisesListClient />
    </div>
  );
}
