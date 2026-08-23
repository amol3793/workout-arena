import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProgressClient } from "./ProgressClient";

export const metadata: Metadata = {
  title: "Progress — workout history & insights",
  description:
    "Track your workout history, strength progression, volume trends and muscle-group balance.",
  alternates: { canonical: "/progress" },
};

export default function ProgressPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Progress" }]} />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Progress</h1>
        <p className="mt-2 text-slate-600">
          Your workout history and performance trends. The more you log, the smarter the AI gets.
        </p>
      </div>
      <ProgressClient />
    </div>
  );
}
