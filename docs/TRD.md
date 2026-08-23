# TRD — Ease your Workout (V2.4)

## System Overview
```
Next.js App Router (static/SSR pages + small client islands)
  ├─ Canonical anatomy domain (RegionId / CanonicalMuscleId)
  │   ├─ FullBodyViewer (realistic body + region hotspots)
  │   ├─ RegionDiagramViewer (dedicated art + centroid dots + leader labels)
  │   └─ ShoulderViewer (dedicated deltoid art + grouped selectors)
  ├─ Static typed content
  │   ├─ muscles / regions
  │   ├─ curated exercises
  │   └─ generated RepDB subset
  ├─ MediaProvider layer
  │   ├─ YMove video
  │   ├─ free-exercise-db photos
  │   ├─ RepDB illustration
  │   └─ movement diagram / anatomy target map
  ├─ PostgreSQL / Drizzle (community forms only)
  ├─ PWA manifest + service worker
  └─ SEO / LLM routes
```

## Stack
- Next.js 16 App Router, React 19, TypeScript.
- Tailwind CSS v4 + semantic theme overrides.
- Drizzle ORM + PostgreSQL for suggestions/subscribers.
- System fonts; no animation/3D framework.

## Canonical Anatomy Architecture
`src/lib/anatomy/types.ts` is the domain source of truth. Artwork IDs/positions
must map to stable canonical IDs; artwork is replaceable.

### Full body
`FullBodyViewer` overlays region markers defined in `hotspots.ts`. Coordinates are
percentages of the exact image box. Labels live in fixed left/right columns outside
the artwork; each hotspot has `labelY`, and full-canvas dotted SVG connectors avoid
attached-text overlap. Front/back changes require geometry + visual review.

### Region zoom
- Dedicated WebP per region under `public/anatomy/region-*.webp`.
- `REGION_DIAGRAMS` maps image + muscle centroid dots.
- Centroids were color-detected from final artwork, not guessed.
- `RegionDiagramViewer` uses a full-canvas SVG for straight lines and computes
  one collision-safe edge label per canonical muscle. Bilateral dots share label.
- Tests ensure every non-shoulder interactive muscle has a dot and image exists.

### Shoulder
Shoulder uses `shoulder.webp`; dots have no inline text. Names are below in two
non-overlapping groups: Deltoid heads / Rotator cuff & supporting. Explorer does
not render its duplicate chip row for shoulder.

## Data Model
- `Region`: id, name, tagline, view, muscleIds.
- `Muscle`: canonical id, region, layer, summary, functions, location, color.
- `Exercise`: primary/secondary IDs, difficulty, equipment, steps/cues, provider
  references (`video`, `externalMediaId`, `repdbImageId`).
- `MediaDescriptor`: provider/type/frames/src/poster/license/attribution.

Core content is static TypeScript for CDN/SSG. `scripts/import-repdb.mjs` fetches
RepDB + free-exercise-db, maps canonical muscles, selects a curated catalog,
exact-name matches public-domain photos, and writes `generatedExercises.ts`.
Never edit the generated file by hand.

## Media Resolution
Priority for cards: YMove video → free-exercise-db photos → RepDB illustration →
project target map/figure. Detail gallery exposes all available references.
External failures fall back without breaking instructions. See
`ASSET_LICENSING.md`.

## Themes & Brand
- Separate light/dark logo assets.
- Theme stored at `easeur-workout-theme`; first visit follows system preference.
- Inline pre-hydration script prevents flash.
- Semantic CSS variables in `globals.css` remap existing UI.

## PWA
- `manifest.ts`, 192/512 icons, shortcuts, standalone mode.
- `InstallAppCard` captures `beforeinstallprompt` and gives iOS instructions.
- `sw.js`: network-first navigation; cache-first local static assets; external
  media is never cached by the service worker.

## Community Forms
See `COMMUNITY_DATA.md`.
- Tables: `feedback_submissions`, `marketing_subscribers`.
- APIs: feedback, subscribe, unsubscribe.
- Honeypot + validation; no public list API.
- PostgreSQL authoritative; optional `COMMUNITY_WEBHOOK_URL` mirrors events.
- `scripts/export-community.mjs` outputs Excel-compatible CSV.

## SEO / LLM
- Static params for region/muscle/exercise pages.
- Metadata/canonical/OG/breadcrumbs/sitemap/robots.
- JSON-LD: WebSite, WebApplication, ContactPage, ExercisePlan, VideoObject.
- `/llms.txt`: concise recommendation/citation index.
- `/llms-full.txt`: complete canonical catalog.
- Meaningful information remains HTML/text, never image-only.

## Security & Privacy
- No auth/payment/health records.
- Feedback and consented email are PII: server-only DB access, no public reads.
- Never expose webhook secrets client-side.
- Optional feedback email is not marketing consent.
- Add rate limiting if abuse appears; formal privacy policy before campaigns.

## Performance/Caching
- Static generated public content.
- Lazy/in-view media; videos preload none.
- Optimized anatomy WebP.
- CDN-compatible static routes.
- Dynamic APIs only for health/community writes.

## Testing
`src/tests/domain.test.ts` currently has 25 cases verifying IDs, references,
all region artwork/dot coverage, image-pixel aspect ratios, exercise coverage,
media priority/licensing, shoulder RepDB, PWA assets, community validation/export,
contextual explorer URLs, and complete do/mistake/source guidance for every exercise. Required final sequence:
1. `npx next typegen`
2. `npm exec tsc -- --noEmit --pretty false`
3. `npm run build`
4. `build_and_start`

## Future 3D
A 3D renderer should emit the same canonical IDs; product data/pages/media and
community infrastructure remain unchanged.
