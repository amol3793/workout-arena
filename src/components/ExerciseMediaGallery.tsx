"use client";

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "@/data/types";
import {
  freeExerciseDbProvider,
  openGymProvider,
  repDbProvider,
  svgFigureProvider,
  ymoveVideoProvider,
} from "@/lib/media";
import type { MediaDescriptor } from "@/data/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { isDataSourceEnabled } from "@/lib/productConfig";
import { ExerciseFigure } from "@/lib/media/svgFigures";
import { ExerciseTargetMap } from "./ExerciseTargetMap";

/**
 * Gallery component that shows ALL available media for an exercise:
 * - Video (YMove, if available)
 * - Photo sequence (free-exercise-db, if available)
 * - SVG figure (always available as fallback)
 * User can tab between them.
 */

interface Tab {
  id: string;
  label: string;
  icon: string;
  media: MediaDescriptor;
}

export function ExerciseMediaGallery({
  exercise,
  className = "",
}: {
  exercise: Exercise;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [frame, setFrame] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Build the list of available media tabs.
  const tabs: Tab[] = [];

  // 1. Real-human video (YMove)
  if (isDataSourceEnabled("ymove") && exercise.video) {
    const m = ymoveVideoProvider.resolve(exercise);
    tabs.push({ id: "video", label: "YMove video", icon: "▶", media: m });
  }
  // 2. Real-human photo sequence (free-exercise-db)
  if (isDataSourceEnabled("freeExerciseDb") && exercise.externalMediaId) {
    const m = freeExerciseDbProvider.resolve(exercise);
    if (m.type === "image-sequence") {
      tabs.push({ id: "photos", label: "Human photos", icon: "◉", media: m });
    }
  }
  // 3. Animated GIF demo (OpenGym / Gym visual)
  if (isDataSourceEnabled("openGym") && exercise.openGymGif) {
    const m = openGymProvider.resolve(exercise);
    tabs.push({ id: "opengym-gif", label: "Animated demo", icon: "🎞", media: m });
  }
  // 4. Illustrated start/peak frames (RepDB)
  if (isDataSourceEnabled("repdb") && exercise.repdbImageId) {
    const m = repDbProvider.resolve(exercise);
    if (m.type === "image-sequence") {
      tabs.push({ id: "illustration", label: "RepDB illustration", icon: "◆", media: m });
    }
  }
  // 4. Movement-specific diagram or exercise-aware target map
  {
    const m = svgFigureProvider.resolve(exercise);
    tabs.push({
      id: exercise.figure && exercise.figure !== "generic" ? "figure" : "target-map",
      label: exercise.figure && exercise.figure !== "generic" ? "Movement diagram" : "Target map",
      icon: "◎",
      media: m,
    });
  }

  const current = tabs[activeTab] ?? tabs[0];

  // In-view detection for lazy loading.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "150px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Video play/pause.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || current.id !== "video") return;
    if (inView && !reduced) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduced, current.id]);

  // Photo/illustration frame animation.
  const frames = current.media.frames ?? [];
  const isSequence = current.media.type === "image-sequence";
  useEffect(() => {
    if (!isSequence || reduced || !inView || frames.length < 2) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % frames.length), 1100);
    return () => clearInterval(t);
  }, [isSequence, reduced, inView, frames.length]);

  const markFailed = (id: string) => setFailed((s) => new Set(s).add(id));

  return (
    <div ref={containerRef} className={className}>
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Exercise demonstration formats">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={i === activeTab}
              onClick={() => { setActiveTab(i); setFrame(0); }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-sm ${
                i === activeTab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span aria-hidden>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Media content */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50 ring-1 ring-slate-200">
        <div className="flex aspect-[4/3] items-center justify-center">
          {current.id === "opengym-gif" && current.media.src && !failed.has("opengym-gif") ? (
            <img
              src={inView ? current.media.src : undefined}
              alt={current.media.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain bg-white p-2"
              onError={() => markFailed("opengym-gif")}
            />
          ) : current.id === "video" && current.media.src && !failed.has("video") ? (
            <video
              ref={videoRef}
              src={inView ? current.media.src : undefined}
              poster={current.media.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label={current.media.alt}
              className="h-full w-full object-cover"
              onError={() => markFailed("video")}
            />
          ) : isSequence && frames.length > 0 && !failed.has(current.id) ? (
            <>
              {frames.map((src, i) => (
                <img
                  key={src}
                  src={inView ? src : undefined}
                  alt={i === 0 ? current.media.alt : ""}
                  aria-hidden={i !== 0}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
                  style={{ opacity: i === frame ? 1 : 0 }}
                  onError={() => markFailed(current.id)}
                />
              ))}
            </>
          ) : current.id === "target-map" ? (
            <ExerciseTargetMap exercise={exercise} />
          ) : current.media.figure ? (
            <ExerciseFigure kind={current.media.figure} title={current.media.alt} className="h-full w-full max-h-64 p-4" />
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <span aria-hidden className="text-3xl">🏋️</span>
              <p className="text-sm font-medium text-slate-700">Demonstration unavailable</p>
              <p className="text-xs text-slate-500">View the step-by-step instructions below.</p>
            </div>
          )}
        </div>

        {/* Credit */}
        {current.media.credit && (current.id === "video" || current.id === "photos" || current.id === "illustration") && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-medium text-white/90">
            {current.media.credit}
          </span>
        )}
      </div>

      {/* Attribution */}
      {(current.media.type === "video" || current.media.type === "image-sequence") && (
        <p className="mt-2 text-xs text-slate-400">
          Source:{" "}
          {current.media.sourceUrl ? (
            <a
              href={current.media.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-600"
            >
              {current.media.attribution}
            </a>
          ) : (
            current.media.attribution
          )}{" "}
          · {current.media.license}
        </p>
      )}
    </div>
  );
}
