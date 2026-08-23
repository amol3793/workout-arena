# Ease your Workout — AI/Developer Handoff

This directory is the repository source of truth. Do not rely on conversation
history.

## Read Order
1. `BUILD_STATE.md` — what exists now, limitations, next step.
2. `PRD.md` — product intent and current requirements.
3. `TRD.md` — architecture, data/media/PWA/community/SEO implementation.
4. `DECISION_LOG.md` — why major choices were made; do not silently reverse.
5. `FEATURE_LIST.md` — implemented/planned/rejected inventory.
6. `ASSET_LICENSING.md` — mandatory before touching any media.
7. `AI_ARCHITECTURE.md` — AI fitness layer design, prompts, and expansion points.
8. `LOCAL_SETUP.md` — run locally after download from Arena.ai.
9. `ZOOM_AUDIT.md` — regional artwork/marker UI matrix.
10. `COMMUNITY_DATA.md` — feedback/subscriber operations and Excel integration.

## Rules for Future Changes
- Canonical IDs, not artwork names, are the domain source of truth.
- Update tests + docs in the same change.
- Never add unverified exercise/anatomy media.
- Generated `src/data/generatedExercises.ts` must only be changed by
  `node scripts/import-repdb.mjs`.
- Optional feedback email must never become marketing consent.
- Run 21+ domain tests, typegen, TypeScript, build, then managed health check.
- If region art changes, redetect/tune centroids and update `ZOOM_AUDIT.md`.

## Key Code Entry Points
- Explorer: `src/components/Explorer.tsx`
- Anatomy geometry: `src/components/anatomy/hotspots.ts`
- Regional labels: `RegionDiagramViewer.tsx`
- Canonical ids: `src/lib/anatomy/types.ts`
- Domain data: `src/data/`
- Media resolution: `src/lib/media/index.ts`
- PWA: `manifest.ts`, `InstallAppCard.tsx`, `public/sw.js`
- Community: `src/db/schema.ts`, `/api/{feedback,subscribe,unsubscribe}`
- SEO/LLM: metadata pages, `sitemap.ts`, `llms*.txt/route.ts`
