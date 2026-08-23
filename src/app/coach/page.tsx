import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CoachClient } from "./CoachClient";

export const metadata: Metadata = {
  title: "AI Coach — personalized training guidance",
  description:
    "Ask EaseurWorkout's AI coach about your training plan, exercise alternatives, progression, recovery, and more.",
  alternates: { canonical: "/coach" },
};

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "AI Coach" }]} />
      <div className="mb-5">
        <p className="easeur-rainbow inline-block text-xs font-bold uppercase tracking-[0.15em]">AI-powered</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          AI Coach
        </h1>
      </div>
      <CoachClient />
    </div>
  );
}
