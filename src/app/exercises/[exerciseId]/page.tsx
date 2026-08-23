import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ExerciseMediaGallery } from "@/components/ExerciseMediaGallery";
import { DifficultyBadge, Pill, Tag } from "@/components/ui";
import { EXERCISES, getExercise, getMuscle, getRegion } from "@/data";
import { resolveExerciseMedia } from "@/lib/media";
import { getFormGuidance } from "@/lib/guidance";
import { explorerUrl } from "@/lib/navigation";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return EXERCISES.map((e) => ({ exerciseId: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}): Promise<Metadata> {
  const { exerciseId } = await params;
  const exercise = getExercise(exerciseId);
  if (!exercise) return { title: "Exercise not found" };
  return {
    title: `${exercise.name} — how to do it`,
    description: exercise.summary,
    alternates: { canonical: `/exercises/${exercise.id}` },
    openGraph: {
      title: `${exercise.name} — how to do it`,
      description: exercise.summary,
    },
  };
}

export default async function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ exerciseId: string }>;
}) {
  const { exerciseId } = await params;
  const exercise = getExercise(exerciseId);
  if (!exercise) notFound();

  const primary = exercise.primaryMuscles.map((id) => getMuscle(id)).filter(Boolean);
  const secondary = exercise.secondaryMuscles.map((id) => getMuscle(id)).filter(Boolean);
  const media = resolveExerciseMedia(exercise);
  const guidance = getFormGuidance(exercise);
  const primaryMuscle = primary[0];
  const muscleRegion = primaryMuscle ? primaryMuscle.region : undefined;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ExercisePlan",
    name: exercise.name,
    description: exercise.summary,
    url: `${SITE.url}/exercises/${exercise.id}`,
    exerciseType: "Resistance training",
    activityDuration: "PT5M",
    intensity: exercise.difficulty,
  };
  if (media.type === "video" && media.src) {
    jsonLd.video = {
      "@type": "VideoObject",
      name: `${exercise.name} demonstration`,
      description: exercise.summary,
      thumbnailUrl: media.poster ? `${SITE.url}${media.poster}` : undefined,
      contentUrl: `${SITE.url}${media.src}`,
      uploadDate: "2024-01-01",
    };
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          ...(muscleRegion
            ? [{ label: getRegion(muscleRegion)?.name ?? muscleRegion, href: `/muscles/${muscleRegion}` }]
            : []),
          ...(primaryMuscle
            ? [{ label: primaryMuscle.name, href: `/muscles/${primaryMuscle.id}` }]
            : []),
          { label: exercise.name },
        ]}
      />

      {/* Back path — never leave the user lost */}
      <div className="mb-6 flex flex-wrap gap-2">
        {primaryMuscle && (
          <>
            <BackLink href={explorerUrl(primaryMuscle.region, primaryMuscle.id)}>
              Back to {primaryMuscle.shortName} anatomy
            </BackLink>
            <BackLink href={`/muscles/${primaryMuscle.id}`}>
              All {primaryMuscle.shortName} exercises
            </BackLink>
          </>
        )}
        <BackLink href="/#explorer">Full body explorer</BackLink>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ExerciseMediaGallery exercise={exercise} />

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {exercise.name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DifficultyBadge level={exercise.difficulty} />
            {exercise.equipment.map((eq) => (
              <Tag key={eq}>{eq}</Tag>
            ))}
          </div>
          <p className="mt-4 text-lg leading-relaxed text-slate-700">{exercise.summary}</p>
          <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span className="font-semibold">Key cue:</span> {exercise.keyCue}
          </p>

          <div className="mt-5 space-y-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary muscles</span>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {primary.map((m) => (
                  <Link key={m!.id} href={`/muscles/${m!.id}`} className="hover:underline">
                    <Pill color={m!.color}>{m!.name}</Pill>
                  </Link>
                ))}
              </div>
            </div>
            {secondary.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secondary muscles</span>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  {secondary.map((m) => (
                    <Link key={m!.id} href={`/muscles/${m!.id}`} className="hover:underline">
                      <Pill color={m!.color}>{m!.name}</Pill>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900">How to perform it</h2>
          <ol className="mt-4 space-y-3">
            {exercise.steps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Do&apos;s, don&apos;ts & common mistakes</h2>

          <h3 className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">Do this</h3>
          <ul className="mt-2 space-y-2">
            {guidance.dos.map((tip) => (
              <li key={tip} className="flex gap-3 rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-100 dark:bg-emerald-950/30 dark:ring-emerald-900">
                <span aria-hidden className="font-bold text-emerald-600">✓</span>
                <span className="text-sm text-slate-700">{tip}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-rose-700">Avoid these common mistakes</h3>
          <ul className="mt-2 space-y-2">
            {guidance.mistakes.map((mistake) => (
              <li key={mistake} className="flex gap-3 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-100 dark:bg-rose-950/30 dark:ring-rose-900">
                <span aria-hidden className="font-bold text-rose-600">×</span>
                <span className="text-sm text-slate-700">{mistake}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-xs text-slate-400">
            Written guidance source:{" "}
            {guidance.source.url ? (
              <a href={guidance.source.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
                {guidance.source.label}
              </a>
            ) : (
              guidance.source.label
            )}
            . Stop if you feel sharp pain.
          </p>
        </div>
      </section>
    </div>
  );
}
