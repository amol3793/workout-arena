import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import sharp from "sharp";
import {
  EXERCISES,
  MUSCLES,
  REGIONS,
  getExercise,
  getExercisesForMuscle,
  getExercisesForRegion,
  getInteractiveMuscles,
  getMuscle,
  getPrimaryExercisesForMuscle,
} from "@/data";
import {
  BODY_REGION_HOTSPOTS,
  DELTOID_HOTSPOTS,
  REGION_DIAGRAMS,
} from "@/components/anatomy/hotspots";
import { SVG_MAP, svgIdToCanonical } from "@/lib/anatomy/svgMap";
import type { RegionId } from "@/lib/anatomy/types";
import {
  freeExerciseDbProvider,
  layeredProvider,
  repDbProvider,
  resolveExerciseMedia,
  ymoveVideoProvider,
} from "@/lib/media";
import { MARKETING_CONSENT_TEXT, normalizeEmail } from "@/lib/community";
import { getFormGuidance } from "@/lib/guidance";
import { explorerUrl } from "@/lib/navigation";

/* ---------- Canonical id integrity ---------- */

test("all muscle ids are unique kebab-case slugs", () => {
  const ids = MUSCLES.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate muscle ids");
  for (const id of ids) assert.match(id, /^[a-z]+(-[a-z]+)*$/);
});

test("all exercise ids are unique kebab-case slugs", () => {
  const ids = EXERCISES.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate exercise ids");
  for (const id of ids) assert.match(id, /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
});

/* ---------- SVG map <-> canonical id consistency ---------- */

test("every SVG map target resolves to a known muscle or region", () => {
  const regionIds = new Set(REGIONS.map((r) => r.id));
  const muscleIds = new Set(MUSCLES.map((m) => m.id));
  for (const [svgId, canonical] of Object.entries(SVG_MAP)) {
    const known = regionIds.has(canonical) || muscleIds.has(canonical as never);
    assert.ok(known, `SVG id ${svgId} -> unknown canonical ${canonical}`);
  }
});

test("svgIdToCanonical maps the three deltoids and returns null for unknown ids", () => {
  assert.equal(svgIdToCanonical("svg-anterior-deltoid"), "anterior-deltoid");
  assert.equal(svgIdToCanonical("svg-lateral-deltoid"), "lateral-deltoid");
  assert.equal(svgIdToCanonical("svg-posterior-deltoid"), "posterior-deltoid");
  assert.equal(svgIdToCanonical("svg-does-not-exist"), null);
});

/* ---------- Referential integrity ---------- */

test("every exercise references only existing muscles", () => {
  for (const ex of EXERCISES) {
    for (const id of [...ex.primaryMuscles, ...ex.secondaryMuscles]) {
      assert.ok(getMuscle(id), `${ex.id} references missing muscle ${id} (not a CanonicalMuscleId)`);
    }
  }
});

test("every muscle.exerciseIds references only existing exercises", () => {
  for (const m of MUSCLES) {
    for (const id of m.exerciseIds) {
      assert.ok(getExercise(id), `${m.id} references missing exercise ${id}`);
    }
  }
});

test("every region's muscleIds exist and point back to that region", () => {
  for (const r of REGIONS) {
    for (const id of r.muscleIds) {
      const m = getMuscle(id);
      assert.ok(m, `${r.id} lists missing muscle ${id}`);
      assert.equal(m.region, r.id, `${id}.region (${m.region}) != ${r.id}`);
    }
  }
});

/* ---------- Anatomy overlay consistency ---------- */

test("every region has at least one full-body hotspot", () => {
  const covered = new Set<RegionId>();
  for (const side of ["front", "back"] as const) {
    for (const h of BODY_REGION_HOTSPOTS[side]) covered.add(h.region);
  }
  for (const r of REGIONS.filter((r) => r.status === "available")) {
    assert.ok(covered.has(r.id as RegionId), `no full-body hotspot for region ${r.id}`);
  }
});

test("every available region has dedicated zoom artwork (shoulder or diagram)", () => {
  for (const r of REGIONS.filter((r) => r.status === "available")) {
    if (r.id === "shoulder") {
      assert.ok(DELTOID_HOTSPOTS.length > 0, "shoulder has deltoid hotspots");
      continue;
    }
    const d = REGION_DIAGRAMS[r.id as RegionId];
    assert.ok(d, `no dedicated diagram for ${r.id}`);
    assert.ok(d!.image.endsWith(".webp"));
    assert.ok(d!.dots.length > 0, `diagram ${r.id} has no dots`);
  }
});

test("every zoom diagram exists and covers every interactive muscle in its region", () => {
  for (const [region, diag] of Object.entries(REGION_DIAGRAMS)) {
    const valid = new Set(getInteractiveMuscles(region as RegionId).map((m) => m.id));
    const covered = new Set(diag!.dots.map((d) => d.id));
    const assetPath = `public${diag!.image}`;
    assert.ok(existsSync(assetPath), `missing zoom artwork ${assetPath}`);
    for (const d of diag!.dots) {
      assert.ok(valid.has(d.id), `region ${region} has dot for foreign muscle ${d.id}`);
      assert.ok(d.x > 0 && d.x < 100 && d.y > 0 && d.y < 100, `${d.id} dot out of bounds`);
    }
    for (const muscle of valid) {
      assert.ok(covered.has(muscle), `${region} diagram has no marker for ${muscle}`);
    }
  }
});

test("zoom artwork pixel ratios match configured responsive aspects", async () => {
  const expectedRatio: Record<string, number> = {
    "aspect-[3/2]": 3 / 2,
    "aspect-[2/3]": 2 / 3,
  };
  for (const [region, diagram] of Object.entries(REGION_DIAGRAMS)) {
    const metadata = await sharp(`public${diagram!.image}`).metadata();
    assert.ok(metadata.width && metadata.height, `${region} image has no dimensions`);
    const actual = metadata.width! / metadata.height!;
    const expected = expectedRatio[diagram!.aspect];
    assert.ok(expected, `unknown aspect ${diagram!.aspect}`);
    assert.ok(Math.abs(actual - expected) < 0.03, `${region}: ${actual} != ${expected}`);
  }
  const shoulder = await sharp("public/anatomy/shoulder.webp").metadata();
  assert.ok(Math.abs(shoulder.width! / shoulder.height! - 2 / 3) < 0.03);
});

test("deltoid hotspots cover the three heads with valid colors in data", () => {
  const ids = DELTOID_HOTSPOTS.map((h) => h.id);
  for (const id of ["anterior-deltoid", "lateral-deltoid", "posterior-deltoid"]) {
    assert.ok(ids.includes(id as never), `missing deltoid hotspot ${id}`);
    assert.ok(getMuscle(id as never)?.color, `${id} missing color`);
  }
});

/* ---------- Selection -> exercises resolution ---------- */

test("every available region resolves to at least 3 exercises", () => {
  for (const r of REGIONS.filter((r) => r.status === "available")) {
    const ex = getExercisesForRegion(r.id);
    assert.ok(ex.length >= 3, `region ${r.id} has only ${ex.length} exercises`);
  }
});

test("every shoulder muscle (surface + deep) resolves exercises or is explicitly support-only", () => {
  for (const m of getInteractiveMuscles("shoulder")) {
    const all = getExercisesForMuscle(m.id);
    if (m.id === "teres-major") continue; // deep helper, no isolation demo yet
    assert.ok(all.length >= 1, `${m.id} has no exercises`);
  }
});

test("lateral deltoid resolves its lateral raises", () => {
  const primary = getPrimaryExercisesForMuscle("lateral-deltoid").map((e) => e.id);
  assert.ok(primary.includes("dumbbell-lateral-raise"));
});

/* ---------- Media provider + fallback + licensing ---------- */

test("media resolves for every exercise with a license and alt", () => {
  for (const ex of EXERCISES) {
    const media = resolveExerciseMedia(ex);
    assert.ok(media.license.length > 0, `${ex.id} missing license`);
    assert.ok(media.alt.length > 0, `${ex.id} missing alt`);
    assert.ok(["video", "image-sequence", "svg-figure", "gif"].includes(media.type));
  }
});

test("layered provider prefers video > free-exercise-db > repdb > figure", () => {
  for (const ex of EXERCISES) {
    const media = layeredProvider.resolve(ex);
    if (ex.video) {
      assert.equal(media.type, "video", `${ex.id} should resolve to video`);
      assert.ok(media.src?.endsWith(".mp4"));
      assert.ok(media.poster);
    } else if (ex.externalMediaId) {
      assert.equal(media.provider, "free-exercise-db");
    } else if (ex.repdbImageId) {
      assert.equal(media.provider, "repdb");
    } else if (ex.openGymGif) {
      assert.equal(media.provider, "opengym");
    } else {
      assert.equal(media.type, "svg-figure");
    }
  }
});

test("all RepDB-sourced exercises carry the required attribution", () => {
  for (const ex of EXERCISES.filter((e) => e.repdbImageId)) {
    const media = repDbProvider.resolve(ex);
    assert.equal(media.attribution, "RepDB");
    assert.ok(media.sourceUrl?.includes("repdb.co"), `${ex.id} missing RepDB attribution link`);
    assert.match(media.license, /attribution/i);
  }
});

test("verified human-media coverage spans the catalog", () => {
  const withVideo = EXERCISES.filter((e) => e.video);
  const withPhotos = EXERCISES.filter((e) => e.externalMediaId);
  assert.ok(withVideo.length >= 12, `only ${withVideo.length} verified videos`);
  assert.ok(withPhotos.length >= 35, `only ${withPhotos.length} photo sets`);
  const heads = new Set<string>(withVideo.flatMap((e) => e.primaryMuscles));
  for (const h of ["anterior-deltoid", "lateral-deltoid", "posterior-deltoid"]) {
    assert.ok(heads.has(h), `no video for ${h}`);
  }
});

test("shoulder retains broad RepDB coverage and forearms have exercises", () => {
  const shoulder = getExercisesForRegion("shoulder");
  const shoulderRepDb = shoulder.filter((e) => e.repdbImageId);
  assert.ok(shoulderRepDb.length >= 20, `only ${shoulderRepDb.length} shoulder RepDB exercises`);
  const forearms = getExercisesForRegion("forearms");
  assert.ok(forearms.length >= 7, `only ${forearms.length} forearm exercises`);
});

test("PWA install assets exist", () => {
  for (const path of [
    "public/sw.js",
    "public/brand/app-icon-192.png",
    "public/brand/app-icon-512.png",
    "src/app/manifest.ts",
  ]) assert.ok(existsSync(path), `missing ${path}`);
});

test("community framework validates email and remains exportable", () => {
  assert.equal(normalizeEmail(" Test@Example.COM "), "test@example.com");
  assert.equal(normalizeEmail("not-an-email"), null);
  assert.match(MARKETING_CONSENT_TEXT, /unsubscribe at any time/i);
  for (const path of [
    "src/app/api/feedback/route.ts",
    "src/app/api/subscribe/route.ts",
    "src/app/api/unsubscribe/route.ts",
    "scripts/export-community.mjs",
  ]) assert.ok(existsSync(path), `missing community component ${path}`);
});

test("contextual anatomy URL restores region and selected muscle", () => {
  assert.equal(
    explorerUrl("chest", "pectoralis-major-clavicular"),
    "/?region=chest&muscle=pectoralis-major-clavicular#explorer",
  );
  assert.equal(explorerUrl("forearms"), "/?region=forearms#explorer");
});

test("every exercise has actionable do and common-mistake guidance", () => {
  for (const exercise of EXERCISES) {
    const guidance = getFormGuidance(exercise);
    assert.ok(guidance.dos.length >= 2, `${exercise.id} has insufficient dos`);
    assert.ok(guidance.mistakes.length >= 2, `${exercise.id} has insufficient common mistakes`);
    assert.ok(guidance.source.label.length > 0, `${exercise.id} has no guidance source`);
  }
});

test("providers fall back to an SVG figure when their source is absent", () => {
  const bare = { ...EXERCISES[0], externalMediaId: undefined, video: undefined, repdbImageId: undefined };
  assert.equal(freeExerciseDbProvider.resolve(bare).type, "svg-figure");
  assert.equal(ymoveVideoProvider.resolve(bare).type, "svg-figure");
});
