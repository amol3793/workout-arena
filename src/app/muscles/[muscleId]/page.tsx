import type { Metadata } from "next";
import type { RegionId } from "@/lib/anatomy/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AskAIButton } from "@/components/AskAIButton";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ButtonLink } from "@/components/ui";
import { explorerUrl } from "@/lib/navigation";
import {
  getExercisesForMuscle,
  getExercisesForRegion,
  getInteractiveMuscles,
  getMuscle,
  getPrimaryExercisesForMuscle,
  getRegion,
  MUSCLES,
  REGIONS,
} from "@/data";

/**
 * /muscles/[slug] — renders either a REGION page (e.g. /muscles/chest) or a
 * MUSCLE page (e.g. /muscles/lateral-deltoid). Regions and muscles are the two
 * addressable levels of the canonical id system.
 */
export function generateStaticParams() {
  return [
    ...REGIONS.map((r) => ({ muscleId: r.id })),
    ...MUSCLES.map((m) => ({ muscleId: m.id })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ muscleId: string }>;
}): Promise<Metadata> {
  const { muscleId } = await params;
  const region = getRegion(muscleId);
  if (region) {
    return {
      title: `${region.name} muscles — anatomy & exercises`,
      description: region.tagline,
      alternates: { canonical: `/muscles/${region.id}` },
    };
  }
  const muscle = getMuscle(muscleId);
  if (!muscle) return { title: "Muscle not found" };
  return {
    title: `${muscle.name} — anatomy & exercises`,
    description: muscle.summary,
    alternates: { canonical: `/muscles/${muscle.id}` },
    openGraph: {
      title: `${muscle.name} — anatomy & exercises`,
      description: muscle.summary,
    },
  };
}

export default async function MuscleOrRegionPage({
  params,
}: {
  params: Promise<{ muscleId: string }>;
}) {
  const { muscleId } = await params;
  const region = getRegion(muscleId);
  if (region) return <RegionPage regionId={region.id} />;
  const muscle = getMuscle(muscleId);
  if (!muscle) notFound();
  return <MusclePage muscleId={muscle.id} />;
}

function RegionPage({ regionId }: { regionId: string }) {
  const region = getRegion(regionId)!;
  const muscles = getInteractiveMuscles(region.id);
  const surface = muscles.filter((m) => m.layer === "surface");
  const deep = muscles.filter((m) => m.layer === "deep");
  const exercises = getExercisesForRegion(region.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Muscles", href: "/muscles" },
          { label: region.name },
        ]}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <BackLink href={explorerUrl(region.id as RegionId)}>Back to {region.name} anatomy</BackLink>
        <BackLink href="/muscles">All muscles</BackLink>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
        {region.name}
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">{region.tagline}</p>
      <div className="mt-4">
        <AskAIButton context={`the ${region.name} region`} />
      </div>

      <h2 className="mt-10 text-lg font-bold text-slate-900">Muscles</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {surface.map((m) => (
          <Link
            key={m.id}
            href={`/muscles/${m.id}`}
            className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span className="inline-flex h-10 w-10 rounded-xl ring-2 ring-white" style={{ backgroundColor: m.color }} aria-hidden />
            <h3 className="mt-3 font-semibold text-slate-900">{m.name}</h3>
            <p className="mt-1 text-sm text-slate-600 line-clamp-2">{m.summary}</p>
          </Link>
        ))}
      </div>
      {deep.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deep.map((m) => (
            <li key={m.id}>
              <Link
                href={`/muscles/${m.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: m.color }} aria-hidden />
                <span className="text-sm font-semibold text-slate-800">{m.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-lg font-bold text-slate-900">
        Exercises for {region.name.toLowerCase()} ({exercises.length})
      </h2>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.slice(0, 6).map((ex) => (
          <ExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
      {exercises.length > 6 && (
        <div className="mt-6">
          <ButtonLink href="/exercises" variant="secondary">
            Browse all exercises →
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

function MusclePage({ muscleId }: { muscleId: string }) {
  const muscle = getMuscle(muscleId)!;
  const region = getRegion(muscle.region);
  const primary = getPrimaryExercisesForMuscle(muscle.id);
  const all = getExercisesForMuscle(muscle.id);
  const secondary = all.filter((e) => !primary.includes(e));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Muscles", href: "/muscles" },
          { label: region?.name ?? muscle.region, href: `/muscles/${muscle.region}` },
          { label: muscle.name },
        ]}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <BackLink href={explorerUrl(muscle.region, muscle.id)}>
          Back to {muscle.shortName} anatomy
        </BackLink>
        <BackLink href={`/muscles/${muscle.region}`}>All {region?.name ?? muscle.region} muscles</BackLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex items-center gap-4">
            <span className="h-14 w-14 shrink-0 rounded-2xl shadow ring-2 ring-white" style={{ backgroundColor: muscle.color }} aria-hidden />
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{muscle.name}</h1>
              <p className="text-sm text-slate-500">
                {region?.name} · {muscle.layer === "deep" ? "Deep muscle" : "Surface muscle"} · {muscle.location}
              </p>
            </div>
          </div>

          <p className="mt-5 text-lg leading-relaxed text-slate-700">{muscle.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Functions</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                {muscle.functions.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</h2>
              <p className="mt-2 text-sm text-slate-700">{muscle.location}</p>
            </div>
          </div>
        </div>

        <aside className="rounded-2xl bg-gradient-to-b from-blue-50 to-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Explore visually</h2>
          <p className="mt-1 text-sm text-slate-600">
            See this muscle highlighted on the interactive body.
          </p>
          <div className="mt-4">
            <ButtonLink href={explorerUrl(muscle.region, muscle.id)} className="w-full">
              Open highlighted anatomy →
            </ButtonLink>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <AskAIButton context={`the ${muscle.name} muscle`} />
      </div>

      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Best exercises for the {muscle.shortName}
        </h2>
        {primary.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {primary.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl bg-white p-6 text-slate-600 ring-1 ring-slate-200">
            This muscle is trained as a supporting muscle. See related exercises
            below, or explore the{" "}
            <Link href={`/muscles/${muscle.region}`} className="font-semibold text-blue-700 hover:underline">
              other {region?.name.toLowerCase()} muscles
            </Link>
            .
          </p>
        )}

        {secondary.length > 0 && (
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-slate-900">
              Also trains this muscle
            </h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {secondary.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
