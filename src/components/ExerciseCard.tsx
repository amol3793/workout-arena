import { getMuscle } from "@/data";
import type { Exercise } from "@/data/types";
import { ExerciseMedia } from "./ExerciseMedia";
import { ButtonLink, DifficultyBadge, Pill, Tag } from "./ui";

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const primary = exercise.primaryMuscles.map((id) => getMuscle(id)).filter(Boolean);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:shadow-lg hover:shadow-slate-200/60">
      <ExerciseMedia exercise={exercise} className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={exercise.difficulty} />
          {exercise.equipment.map((eq) => (
            <Tag key={eq}>{eq}</Tag>
          ))}
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{exercise.name}</h3>
        <div className="flex flex-wrap gap-1.5" aria-label="Available demonstration sources">
          {exercise.video && (
            <span title="Real human HD video from YMove" className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-rose-100">
              ▶ Video
            </span>
          )}
          {exercise.externalMediaId && (
            <span title="Real human photos from free-exercise-db" className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
              ◉ Photos
            </span>
          )}
          {exercise.repdbImageId && (
            <span title="Start and peak illustrations from RepDB" className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 ring-1 ring-violet-100">
              ◆ RepDB
            </span>
          )}
          {exercise.openGymGif && (
            <span title="Animated GIF demo from OpenGym (© Gym visual)" className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700 ring-1 ring-cyan-100">
              🎞 OpenGym
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {primary.map((m) => (
            <Pill key={m!.id} color={m!.color}>
              {m!.name}
            </Pill>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{exercise.summary}</p>
        <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-900">
          <span className="font-semibold">Key cue:</span> {exercise.keyCue}
        </p>
        <div className="mt-auto pt-1">
          <ButtonLink href={`/exercises/${exercise.id}`} variant="secondary" className="w-full">
            View exercise →
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
