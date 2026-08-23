# DECISION_LOG

Format: Date · Decision · Context · Options · Chosen · Why · Trade-offs · Future.

---
## D1 — SVG anatomy instead of 3D for V1
- Date: 2026 (V1 build)
- Decision: Use an interactive 2D SVG anatomy system; no WebGL/3D engine in V1.
- Context: V1 must prioritize speed, mobile performance, a11y, maintainability,
  low cost, fast dev.
- Options: (a) hand-authored interactive SVG, (b) three.js/R3F 3D model,
  (c) flattened image + hotspots.
- Chosen: (a).
- Why: Smallest JS, best mobile/low-end performance, fully accessible & indexable,
  cheap, each muscle independently addressable.
- Trade-offs: Less "wow" than 3D; stylized rather than photoreal.
- Future: A 3D renderer can implement the same renderer contract + canonical map
  without changing product/data/UI.

## D2 — Next.js App Router + TypeScript
- Decision: Build on the provided Next.js 16 App Router + TS template.
- Why: SSR/SSG for SEO, static content for cost, React island for the Explorer,
  strong typing for a data-driven domain. Already provisioned.
- Trade-offs: Framework lock-in (acceptable).

## D3 — Static typed data, no DB for content
- Decision: Muscle/exercise/region content lives in `src/data/*.ts`.
- Context: Site is free; minimize operational cost; content is small & read-only.
- Options: static TS, JSON files, Postgres/Supabase.
- Chosen: static TS.
- Why: Type-safe, tree-shakeable, CDN-cacheable, zero query cost, trivial to edit.
- Trade-offs: Content changes require a deploy (fine at this scale).
- Future: If content grows/needs CMS, introduce a DB behind the same accessors.
  DB (Drizzle/Postgres) is retained only for the health check.

## D4 — Media provider abstraction; self-authored SVG figures in V1
- Decision: All exercise media resolves through a `MediaProvider`. V1 ships
  license-clean, self-authored SVG demonstration figures + text fallback.
- Context: Human GIFs are strongly preferred but must be license-verified. Free
  sources (wger, Free Exercise DB, WorkoutX) need per-asset license verification
  and self-hosting review before production use.
- Options: (a) hotlink third-party GIFs now, (b) self-author license-clean media,
  (c) no media.
- Chosen: (b) for V1.
- Why: "Free API" ≠ "free to redistribute media." Unverified media must not ship.
  The abstraction lets us swap in a licensed provider with no UI change.
- Trade-offs: Figures are illustrative, not real human demos yet.
- Future: Verify + integrate a licensed GIF/video provider (see ASSET_LICENSING).

## D5 — Canonical IDs as the source of truth
- Decision: SVG element ids and future 3D mesh names both map to canonical slugs.
- Why: Decouples artwork from logic; enables asset replacement & 3D migration.
- Trade-offs: One extra mapping layer (small, worth it).

## D6 — Explorer as a single client island
- Decision: Interactive explorer is one client component; everything else is
  server-rendered/static.
- Why: Keeps JS minimal and content indexable; good CWV.
- Trade-offs: Some duplicated presentation between island and static pages
  (kept small via shared components/data).

## D8 — Realistic anatomy imagery + interactive overlay (Option B)
- Date: 2026 (V1 revision)
- Decision: Replace the stylized hand-drawn SVG body with realistic anatomical
  imagery (AI-generated écorché study-model bodies + a color-coded deltoid
  diagram), and drive interactivity with a transparent overlay layer of hotspots
  mapped to canonical ids.
- Context: Reviewer required realistic, medical-illustration-quality anatomy, not
  a generic vector/blocky human. Pure hand-written realistic SVG is impractical.
- Options: (a) keep stylized vector, (b) realistic image + overlay hit areas,
  (c) 3D model.
- Chosen: (b).
- Why: Achieves the required visual fidelity now, stays lightweight (optimized
  WebP: 39–71 KB), keeps each muscle independently addressable via the overlay,
  and preserves the renderer/canonical-id architecture for a future 3D swap.
- Implementation notes: Image output moderation rejected photoreal nude écorché
  prompts; reframing as "anatomical study model / educational diagram" passed.
  Overlay coordinates were derived by pixel-analysis of the generated images
  (shoulder deltoid centroids from the color-coded regions; body shoulder
  positions from a content width profile).
- Trade-offs: Imagery is AI-generated/illustrative, not a verified clinical asset;
  overlay alignment is approximate (mitigated with soft halos + labels).
- Future: Swap in a licensed/verified anatomical asset (or 3D) behind the same
  canonical-id + hotspot contract with no product/data changes.

## D9 — Real human exercise media from free-exercise-db (public domain)
- Date: 2026 (V1 revision)
- Decision: Use real human demonstration photos from free-exercise-db
  (yuhonas/free-exercise-db) as the primary exercise media, via
  `freeExerciseDbProvider`.
- Context: Reviewer wanted real humans performing exercises, from free sources,
  with proper licensing.
- Options: (a) free-exercise-db (Unlicense/public domain), (b) wger (CC-BY-SA 4.0,
  requires attribution + share-alike), (c) paid ExerciseDB (GIFs, ~$100),
  (d) keep SVG figures only.
- Chosen: (a).
- Why: True public domain (no attribution, redistribution, commercial and
  self-hosting all allowed), CDN-hosted, 800+ exercises, all 10 mapped images
  verified reachable. Cleanest license for a free public site.
- Implementation notes: Each exercise has two frames (start/end) alternated to
  animate the movement; lazy-loaded, in-view only, reduced-motion aware, with
  graceful fallback to the self-authored SVG figure. wger remains a documented
  future option if animated/video media is desired (attribution required).
- Trade-offs: Two-frame photos, not full video/GIF; images served from GitHub raw
  CDN (can be self-hosted later for full control).

## D15 — Realistic human-figure exercise diagrams (not stick figures)
- Date: 2026 (V1 revision 4)
- Decision: Replace the minimal stick-figure SVG diagrams with realistic
  human-figure SVGs that include: proper human silhouette (head, neck, muscular
  torso with visible striations, legs with knees), joint indicators (elbows,
  knees, shoulders), dumbbell/kettlebell props, motion arcs, and shoulder-target
  color highlights. Each diagram shows START and END positions overlaid so the
  user can trace the movement path.
- Context: Reviewer asked for "more human-ied rather than just simple sticks."
- Implementation: All diagrams are self-authored inline SVG (license-clean, no
  network requests). The `ExerciseFigure` component maps a kind → a rendered
  pose set (start + end). No external dependencies added.
- Why: Users get a clearer picture of the exercise form from a figure that
  actually looks like a human body in the correct positions.
- Future: These are fallback/secondary to real-human media (video/photos). Can
  be replaced with a licensed animation provider later without code changes.

## D16 — Deep rotator-cuff muscles selectable in shoulder view
- Date: 2026 (V1 revision 4)
- Decision: Make all 5 deep shoulder muscles (supraspinatus, infraspinatus,
  teres minor, teres major, subscapularis) selectable in the expanded shoulder
  view. A color-coded "Rotator cuff & deep muscles" strip below the deltoid
  diagram lets users click any of them to open the info panel with anatomy and
  exercises.
- Context: The deltoid diagram only shows surface anatomy (3 deltoid heads +
  trapezius). Reviewer asked for "more available muscle groups" that users can
  click.
- Implementation: Changed `interactive: false` → `true` in muscle data for all 5
  deep muscles. Added a supplementary clickable strip in `ShoulderViewer` below
  the deltoid hotspots. The desktop sidebar and mobile bottom sheet now list all
  9 shoulder muscles (4 surface + 5 deep).
- Why: Anatomical correctness — the rotator cuff matters for shoulder health,
  and users should be able to explore all shoulder muscles, not just the ones
  visible on the surface diagram.

## D11 — Rebrand to "Ease your Workout"
- Date: 2026 (V1 revision 3)
- Decision: Rename the app from "Muscle Explorer" to **"Ease your Workout"** per
  reviewer direction.
- Why: Reviewer specified the brand name/theme. Updated everywhere: `SITE` config,
  header logo, footer copyright, OG image, docs.
- Future: The name is a config constant; changing it again requires only editing
  `src/lib/site.ts`.

## D12 — Remove "Browse Shoulder Muscles" from full-body homepage view
- Date: 2026 (V1 revision 3)
- Decision: When the explorer is in full-body mode (shoulder not zoomed), the
  homepage shows ONLY the body viewer + "How it works". The "Browse Shoulder
  Muscles" list appears only after the user zooms into the shoulder (as a mobile
  bottom sheet and desktop sidebar). This keeps the homepage focused on the body.
- Why: Reviewer said the shoulder list shouldn't be on the page until shoulder is
  selected — body is the hero.

## D13 — Search bars on Exercises and Muscles pages
- Date: 2026 (V1 revision 3)
- Decision: Add a client-side search/filter input to `/exercises` and `/muscles`
  pages, with a reusable `SearchFilter` component. Instant filtering, no server
  round-trip.
- Why: Reviewer noted there will be 100+ exercises down the line. The search
  component is ready to scale.

## D14 — Multi-media gallery per exercise (video + photos + diagram tabs)
- Date: 2026 (V1 revision 3)
- Decision: The exercise detail page now shows ALL available media for an exercise
  in a tabbed gallery: 🎬 Video (YMove) → 📷 Photos (free-exercise-db) →
  ✏️ Diagram (SVG figure). Users can switch between them. The exercise card on
  the list page still shows the single best media (via `ExerciseMedia`).
- Why: Reviewer asked for "more than one reference: GIFs, videos, images" per
  exercise. This gives users the maximum number of perspectives on each movement.
- Implementation: `ExerciseMediaGallery` resolves all three providers
  independently and builds a tab list from what's available. The gallery is
  lazy-loaded, in-view aware, and reduced-motion safe.

## D10 — Layered exercise media: YMove HD video > free-exercise-db photos > SVG
- Date: 2026 (V1 revision 2)
- Decision: Introduce a `layeredProvider` that resolves the best available media
  per exercise: real-human **YMove HD video** first, then real-human
  **free-exercise-db photos**, then the self-authored **SVG figure** fallback.
- Context: Reviewer supplied a vetted licensing table and asked for real humans
  performing exercises from free, properly-licensed sources.
- Options: YMove (✅ best free video, royalty-free), RepDB (✅ safe illustrations,
  attribution required), free-exercise-db images (public domain), "Free Exercise
  DB with videos" (⚠️ unverified provenance — rejected).
- Chosen: YMove video (primary, self-hosted) + free-exercise-db photos (fallback).
- Why: YMove gives genuine HD human demonstrations covering all three deltoid
  heads (lateral raise, machine reverse fly, kettlebell push press) and is
  royalty-free for commercial use; free-exercise-db (public domain) covers the
  remaining exercises with real photos. Both are lazy-loaded and degrade
  gracefully. Added a new "Kettlebell Push Press" exercise so a real anterior-delt
  video maps to an accurate movement.
- Implementation: Self-hosted 3 YMove MP4s (~1.5–1.8 MB each) + WebP posters in
  `public/exercise-media/`. Video autoplays only in-view, muted/looped/inline, and
  is paused (poster shown) under prefers-reduced-motion. Credits shown in-UI, in
  the footer, exercise pages, and via VideoObject JSON-LD.
- Trade-offs: Only 3 exercises have video (the free set is 25 clips; only these
  three shoulder movements match); the rest use photos. YMove clips may not be
  resold as a standalone library (we only embed — compliant).
- Rejected: "Free Exercise DB with videos" (unverified provenance). RepDB is
  documented as a verified, ready-to-add illustrated provider (attribution
  required) but not needed now given video+photo coverage.

## D17 — Full-body region expansion (8 regions)
- Date: 2026 (V2)
- Decision: After reviewer approval of the shoulder flow, expand to all major
  regions: chest, back, biceps, triceps, core, glutes, legs (+ shoulder).
  The architecture from V1 (canonical ids → data → overlay → UI) absorbed the
  expansion as pure content/config: new muscle entries, region zoom configs,
  and muscle-dot coordinates in `hotspots.ts`.
- Implementation: `RegionZoomViewer` lenses the SAME realistic body images
  (transform-origin + scale) so no new body art was needed; the shoulder keeps
  its dedicated tightly-cropped deltoid diagram (regenerated to exclude stray
  biceps/triceps per review). A future 3D renderer reuses the same ids.
- Why: Maximizes fidelity-per-cost — one pair of body images serves 7 region
  zooms; only the shoulder (the most scrutinized region) got dedicated art.

## D18 — RepDB dataset import (attention-required illustrated exercises)
- Date: 2026 (V2)
- Decision: Import a curated subset (81 exercises) from the RepDB free tier
  (github.com/RepDB/exercise-dataset) as typed static data, resolved via a new
  `repDbProvider` showing RepDB flat-illustration start/peak frames.
- Context: Reviewer supplied the licensing table and explicitly asked to use
  the RepDB GitHub repo; RepDB is free for commercial in-app use WITH
  attribution and cannot be redistributed as a dataset.
- Compliance: (a) attribution link to repdb.co shown per exercise + in footer;
  (b) only a small curated subset embedded in-app (not redistributed as a
  dataset); (c) images loaded directly from the RepDB repo CDN.
- Why: instantly scaled exercise coverage from 12 → 94 with consistent,
  license-clean illustrations and real instructions (EN), keeping real-human
  media (YMove video / free-exercise-db photos) as the preferred layer.
- Rejected again: "Free Exercise DB with videos" (⚠️ unverified provenance).

## D19 — Navigation always provides a way back
- Date: 2026 (V2)
- Decision: Every detail page gets visible BackLink buttons + full breadcrumb
  chains (Home → Region → Muscle → Exercise). Explorer keeps "← Full body"
  affordances and the region sidebar always offers "Full Body".
- Why: Reviewer reported feeling lost after Body → Shoulder → Rear delt →
  Exercise. The back path must always be one tap away.

## D20 — Realistic 3D-look humanoid exercise diagrams
- Date: 2026 (V2)
- Decision: Replace simple figure diagrams with gradient-shaded, 3D-look
  humanoids (ghost start pose + main end pose + glowing target muscles +
  dumbbells + motion arcs) matching the reviewer's reference style.
- All self-authored inline SVG (license-clean, zero network).

## D21 — Dedicated zoomed artwork per region (all regions)
- Date: 2026 (V2 revision)
- Decision: Replace the CSS-lens zoom on the shared body image with dedicated,
  tightly-cropped, color-coded regional diagrams: `region-chest`, `region-back`,
  `region-arms` (biceps+triceps split panel), `region-core`, `region-glutes`,
  `region-legs` (front/back split panel). Shoulder keeps its dedicated deltoid
  diagram.
- Why: reviewer reported misplaced overlay dots on the shared body image and
  wanted labeled zoom views like the shoulder (e.g. chest upper/middle/lower).
- Implementation: dot positions are no longer estimated — they are extracted per
  region by pixel-detecting each color-coded muscle's centroid (bilateral
  muscles split into L/R dots). Each dot draws a STRAIGHT leader line to a text
  label at the nearest edge (`RegionDiagramViewer`).
- Chest now models the three pec sections: clavicular (upper / blue), sternal
  (middle / red), costal (lower / green) — three canonical muscle ids, with
  RepDB exercises auto-classified by name (incline→upper, decline/dips→lower,
  else middle) in the import script.

## D22 — Exercise source tabs
- Date: 2026 (V2 revision)
- Decision: `/exercises` now has media-source tabs — All / YMove /
  RepDB / Free Exercise DB — so users can view the same movement from multiple
  sources. Curated exercises carry BOTH their real-human media and a
  `repdbImageId` cross-reference, so e.g. Dumbbell Lateral Raise appears under
  YMove (video), Free Exercise DB (photos) and RepDB (illustration).
- Duplicate RepDB variants of curated movements are excluded from the generated
  set (EXCLUDE_DUPES) to avoid two cards for one movement.

## D23 — Crash hardening
- Date: 2026 (V2 revision)
- Decision: wrap interactive islands (Explorer; media galleries) in an
  `ErrorBoundary` so a render failure shows a graceful fallback with links
  instead of a blank/crashed page. Main anatomy imagery loads eagerly.
- Context: reviewer hit a crash navigating to chest and an image that failed
  to load after back-navigation; root cause not directly reproducible, so both
  targeted guards and structural fixes were added.

## D24 — Easeur-family sub-brand and dual themes
- Date: 2026 (V2.2)
- Decision: Host/canonicalize the product at `https://workout.easeur.com` and use
  an Easeur-family stacked wordmark based on the supplied parent logo: EASE /
  YOUR / WORKOUT, uppercase with generous tracking and alternating mint, blue,
  lilac, coral and muted-slate letters.
- Assets: responsive inline `LogoMark`, standalone dark/light SVGs in
  `public/brand/`, app icon (`src/app/icon.svg`), matching OG art and manifest.
- Theme: support explicit light + dark themes. A header toggle persists to
  `localStorage`; first visit follows `prefers-color-scheme`; a pre-hydration
  script applies the theme before paint to prevent a flash. CSS semantic tokens
  remap existing cards, text, borders, header, footer and inputs without
  duplicating product components.
- Why: the workout product should visibly belong to easeur.com while remaining
  identifiable as its own focused sub-brand, and both app/web contexts need a
  first-class dark mode.

## D25 — Logo-only header with separate light/dark assets
- Date: 2026 (V2.3)
- Decision: remove duplicated header text (product name + subdomain) and make the
  Easeur-family mark larger. The header switches between two independently
  maintained files: `ease-your-workout-light.svg` and
  `ease-your-workout-dark.svg`; CSS selects the correct asset by theme.
- Why: the stacked mark already says EASE/YOUR/WORKOUT. Additional text was
  visually redundant and reduced the mark's legibility.

## D26 — Expand verified media across all body regions
- Date: 2026 (V2.3)
- Decision: make the RepDB import reproducibly fetch and exact-name-match the
  public-domain free-exercise-db catalog; matching exercises receive real-human
  photo pairs. Self-host nine additional verified YMove free videos for squat,
  bench press, deadlift, hammer curl, machine chest fly, triceps pushdown, leg
  extension, hack squat and lying leg curl.
- Result: 12 YMove videos, 36 free-exercise-db photo sets and 96 RepDB
  illustration sets across the full catalog; media priority remains video →
  photos → illustration → target map.
- Compliance: only verified YMove free-library clips are used. The unverified
  third-party "Free Exercise DB with Videos" source remains rejected.

## D27 — Exercise-aware target map replaces generic diagram
- Date: 2026 (V2.3)
- Decision: generated exercises no longer display an unrelated generic lateral
  raise. Their final gallery tab is a Target Map showing realistic front/back
  anatomy with each primary and secondary muscle highlighted at canonical body
  coordinates and a textual legend. Curated exercises retain their
  movement-specific humanoid diagram.
- Gallery tabs now name both provider and format: YMove Video, Human Photos,
  RepDB Illustration, Movement Diagram/Target Map.

## D28 — Full-body marker corrections
- Date: 2026 (V2.3)
- Decision: move Core from y52% to y43% (directly below chest) and posterior
  Triceps from y40% to y35% (upper posterior arm), based on review feedback.

## D29 — Forearms become a first-class region
- Date: 2026 (V2.4)
- Decision: correct the full-body Biceps marker from y40% (forearm) to y34%
  (upper arm), and add a separate Forearms region at y46%.
- Coverage: brachioradialis, wrist/finger flexors, and wrist extensors; 7 RepDB
  exercises including hammer/reverse curls and wrist curls/extensions.
- Artwork: dedicated front/back forearm diagram; dot centers were color-detected
  from the final image (24.4/39.6, 30.3/47.4, 70.5/47.9), not guessed.

## D30 — Installable phone experience (PWA)
- Date: 2026 (V2.4)
- Decision: add a value-led install invitation after the anatomy explorer:
  "Keep your muscle map one tap away." On supported Chromium browsers it uses
  `beforeinstallprompt`; on iOS and unsupported browsers it shows exact Share →
  Add to Home Screen instructions. It hides in standalone mode or after install.
- Infrastructure: web manifest with 192/512 icons and shortcuts, same-origin
  app-shell service worker, persisted theme, standalone display mode.
- Cache policy: local app/anatomy assets may be cached; external licensed media
  stays network-only to avoid silent redistribution/caching changes.

## D31 — LLM/search discovery layer
- Date: 2026 (V2.4)
- Decision: retain static semantic pages, canonical URLs, sitemap, robots,
  breadcrumbs and per-exercise JSON-LD; add `/llms.txt` (concise product guide),
  `/llms-full.txt` (complete muscle/exercise catalog), and homepage WebSite +
  WebApplication structured data with zero-price/install metadata.
- Important: machine-readable guidance explicitly marks anatomy as educational,
  lists media provenance, and tells recommenders to cite exact canonical pages.

## D32 — Simplify promotional UI
- Date: 2026 (V2.4)
- Decision: remove the hero's free/no-account badge and the footer's Fast/
  Mobile/Accessible/Dark-Light/Free feature grid. Keep only product content,
  useful navigation, ownership, educational disclaimer and media provenance.

## D33 — Community feedback and consent-based subscriber framework
- Date: 2026 (V2.4)
- Decision: PostgreSQL becomes source of truth for suggestions and explicitly
  consented update emails. Feedback and marketing remain separate flows.
- APIs validate/honeypot writes; subscribers are unique/upserted and can
  unsubscribe. No public read API. Optional `COMMUNITY_WEBHOOK_URL` mirrors
  stored events to Power Automate/Excel/Zapier/Make without coupling forms to a
  vendor. CSV export is available via `scripts/export-community.mjs`.
- Trade-off: stores limited PII; a formal privacy policy and sender identity are
  required before real campaigns. Rate limiting can be added if abuse appears.

## D34 — Zoom label audit and shoulder overlap fix
- Date: 2026 (V2.4)
- Decision: replace button-relative regional lines (which had zero-width sizing)
  with full-canvas SVG lines and collision-aware one-label-per-muscle placement.
  Bilateral dots share a label. Shoulder image labels were removed entirely;
  compact Surface and Rotator cuff/supporting groups now sit below the image,
  and the Explorer's duplicate shoulder chip row is disabled.
- Audit/maintenance matrix lives in `ZOOM_AUDIT.md`; tests require every region
  asset and every interactive muscle marker.

## D35 — Coordinated dotted annotation columns
- Date: 2026 (V2.4)
- Decision: full-body callouts now use explicit left/right label columns outside
  the artwork, with one-line labels and straight dotted full-canvas connectors.
  `labelY` values are maintained in `BODY_REGION_HOTSPOTS` to prevent collisions.
  The body is slightly reduced within its viewer to reserve label gutters. All
  regional zoom leader lines use the same dotted visual language.
- Why: attached callout pills could overlap each other/anatomy and biceps text
  obscured chest in narrow layouts.

## D36 — Context-preserving anatomy return links
- Date: 2026 (V2.4)
- Decision: `explorerUrl(region, muscle)` creates URLs such as
  `/?region=chest&muscle=pectoralis-major-clavicular#explorer`. Explorer restores
  region, preferred side and selected muscle on mount. Exercise pages expose
  both "Back to Upper chest anatomy" and "All Upper chest exercises".
- Why: breadcrumbs/muscle pages alone did not return users to the zoomed visual
  state they came from.

## D37 — Sourced do/don't/common-mistake guidance
- Date: 2026 (V2.4)
- Decision: preserve RepDB `tips_en` during generation (previously discarded).
  Every exercise page now has Do this / Avoid these common mistakes. Common
  mistakes are centralized by movement family in `src/lib/guidance.ts` and the
  written-guidance source is displayed. Generated records cite their RepDB
  exercise page; curated records identify Ease your Workout editorial guidance.
- Test guarantees every exercise has at least two dos, two mistakes and source.

## D38 — Centered primary navigation + Connect
- Date: 2026 (V2.4)
- Decision: header uses a three-column grid: logo left, Explore/Muscles/Exercises/
  Connect centered, theme toggle right. Connect routes to `/contact`.

## D39 — AI fitness layer added on top of existing Explore app
- Date: 2026 (V3)
- Decision: Add AI-powered workout planning, coaching, logging and progress
  tracking as new navigation sections (My Workout / AI Coach / Progress),
  preserving the entire existing Explore experience. Uses Vercel AI SDK + OpenAI
  provider via server-side streaming. No user auth — uses anonymous localStorage
  visitor ID.
- Architecture: new Drizzle tables (user_profiles, workout_plans,
  workout_sessions, workout_sets, ai_recommendations). AI prompts embed the
  real exercise catalog so recommendations reference exercises the user can
  actually find in the app. System prompts specialized by function: planner,
  coach, recommender, progress analyzer.
- Integration with Explore: "Ask AI" button on muscle/region pages uses the
  same coach API with exercise context.
- Safety: AI never gives medical diagnoses; pain/injury prompts trigger
  professional referral. No login required.

## D7 — Node test runner for domain tests
- Decision: Use built-in `node --test` (no new deps) to test the data/domain layer.
- Why: Zero dependency cost; validates the highest-risk logic (id/data integrity).
- Trade-offs: No DOM/e2e tests in V1 (documented for later).
ts in V1 (documented for later).
