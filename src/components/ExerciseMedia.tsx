"use client";

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "@/data/types";
import { resolveExerciseMedia } from "@/lib/media";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ExerciseFigure } from "@/lib/media/svgFigures";

/**
 * Renders exercise demonstration media resolved through the MediaProvider.
 *
 * Media priority (see src/lib/media): real-human HD VIDEO (YMove) > real-human
 * PHOTO sequence (free-exercise-db) > self-authored SVG FIGURE.
 *
 * Performance & a11y:
 * - Everything is lazy: media only loads/plays when scrolled into view.
 * - Video is muted, looped, inline; it autoplays only in view and only when the
 *   user has NOT requested reduced motion (otherwise the poster + a play control).
 * - Any load error degrades gracefully (video -> photo/figure -> instructions),
 *   so a broken asset never breaks the page.
 */
export function ExerciseMedia({
  exercise,
  className = "",
  animate = true,
}: {
  exercise: Exercise;
  className?: string;
  animate?: boolean;
}) {
  const media = resolveExerciseMedia(exercise);
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [frame, setFrame] = useState(0);
  const [failed, setFailed] = useState(false);

  // Observe visibility for lazy playback / animation (perf on low-end devices).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isVideo = media.type === "video" && !failed && Boolean(media.src);
  const isGif = media.type === "gif" && !failed && Boolean(media.src);
  const frames = media.type === "image-sequence" ? (media.frames ?? []) : [];
  const hasSequence = frames.length > 0 && !failed;

  // Play/pause the video based on visibility + motion preference.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (inView && animate && !reduced) {
      v.play().catch(() => {
        /* autoplay may be blocked; poster remains visible */
      });
    } else {
      v.pause();
    }
  }, [inView, animate, reduced, isVideo]);

  // Alternate photo frames to animate the movement.
  useEffect(() => {
    if (!hasSequence || !animate || reduced || !inView || frames.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 1100);
    return () => clearInterval(t);
  }, [hasSequence, animate, reduced, inView, frames.length]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 to-blue-50 ${className}`}
    >
      {isGif ? (
        <img
          src={inView ? media.src : undefined}
          alt={media.alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain bg-white p-1"
          onError={() => setFailed(true)}
        />
      ) : isVideo ? (
        <>
          <video
            ref={videoRef}
            src={inView ? media.src : undefined}
            poster={media.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={media.alt}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
          {reduced && (
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-center text-[11px] text-white">
              Motion reduced — showing a still frame
            </span>
          )}
        </>
      ) : hasSequence ? (
        frames.map((src, i) => (
          <img
            key={src}
            src={inView ? src : undefined}
            alt={i === 0 ? media.alt : ""}
            aria-hidden={i !== 0}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
            style={{ opacity: i === frame ? 1 : 0 }}
            onError={() => setFailed(true)}
          />
        ))
      ) : media.figure ? (
        <ExerciseFigure kind={media.figure} title={media.alt} className="h-full w-full max-h-56 p-3" />
      ) : (
        <div className="flex flex-col items-center gap-2 p-6 text-center">
          <span aria-hidden className="text-3xl">🏋️</span>
          <p className="text-sm font-medium text-slate-700">Demonstration unavailable</p>
          <p className="text-xs text-slate-500">View the step-by-step instructions below.</p>
        </div>
      )}

      {/* media source credit */}
      {media.credit && (isVideo || hasSequence) && (
        <span className="absolute bottom-1 right-1 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-medium text-white/90">
          {media.credit}
        </span>
      )}
    </div>
  );
}
