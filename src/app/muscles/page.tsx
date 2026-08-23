import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MUSCLES, REGIONS } from "@/data";
import Link from "next/link";
import { MusclesListClient } from "./MusclesListClient";

export const metadata: Metadata = {
  title: "Muscles",
  description:
    "Browse every major muscle group — shoulders, chest, back, biceps, triceps, core, glutes and legs — with anatomy and exercises for each.",
  alternates: { canonical: "/muscles" },
};

export default function MusclesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Muscles" }]} />
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Muscles</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        {MUSCLES.length} muscles across {REGIONS.length} body regions.
      </p>

      {/* Region quick links */}
      <ul className="mt-6 flex flex-wrap gap-2">
        {REGIONS.map((r) => (
          <li key={r.id}>
            <Link
              href={`/muscles/${r.id}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {r.name}
            </Link>
          </li>
        ))}
      </ul>

      <MusclesListClient />
    </div>
  );
}
