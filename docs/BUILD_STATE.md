# BUILD_STATE

## Current Status
**V2.4 — production-minded full-body prototype** at `workout.easeur.com`.
Health/build passing. Catalog: **9 regions · 31 muscles · 1,394 exercises**
(99 curated+RepDB + 1,295 OpenGym with animated GIF demos).

## Completed
### Brand / themes
- Easeur-family logo-only header with separate light/dark SVG assets.
- Persistent light/dark theme; no-flash initialization.
- Canonical host + OG + manifest + icons.

### Anatomy
- Front/back realistic body with 9 region markers.
- Full-body labels form clean left/right one-line columns with explicit labelY;
  dotted connectors reach each exact region dot without text overlap.
- Biceps corrected to upper arm; Forearms added separately.
- Dedicated zoom artwork for every region.
- Pixel-derived muscle dots; collision-aware dotted leader labels.
- Shoulder labels split into non-overlapping surface/deep groups.
- 31 canonical muscles; HTML alternatives and detail pages.

### Exercises / media
- 1,394 exercises: 12 curated + 87 RepDB + 1,295 OpenGym (animated GIF demos).
- 12 verified self-hosted YMove videos.
- 36 public-domain free-exercise-db photo sets.
- 96 attributed RepDB start/peak illustration sets.
- Source tabs/cards, multi-source gallery, movement diagrams or target maps.
- RepDB `tips_en` retained; every exercise has sourced Do this guidance and
  movement-family common mistakes (25-test regression coverage).

### UX / navigation
- Search, breadcrumbs, explicit BackLinks.
- Mobile bottom sheets, region chips, large touch targets.
- Promotional badge/feature grid removed.

### PWA
- Native install prompt where supported.
- iOS/unsupported browser Add-to-Home instructions.
- 192/512 icons, standalone manifest, shortcuts, offline app shell.

### SEO / LLM
- Static region/muscle/exercise pages and semantic HTML.
- Canonical metadata, OG/Twitter, breadcrumbs, sitemap, robots, JSON-LD.
- `/llms.txt` + `/llms-full.txt`; not linked as user navigation.

### Community
- `/contact` suggestions/bug/content form.
- Consent-based launch-update subscription + unsubscribe.
- PostgreSQL tables applied via Drizzle.
- Optional webhook for Excel/Power Automate; CSV export script.
- End-to-end write/subscribe/unsubscribe tested against DB, test rows removed.

### AI Fitness Layer (V3)
- `/workout` — profile setup + AI-generated weekly workout plan
- `/coach` — context-aware streaming AI chat (uses profile + plan + history)
- `/progress` — workout history dashboard
- "Ask AI" recommendation button on muscle/region detail pages
- DB: user_profiles, workout_plans, workout_sessions, workout_sets, ai_recommendations
- Vercel AI SDK + OpenAI provider; graceful fallback when OPENAI_API_KEY not set
- System prompts embed real exercise catalog for grounded recommendations
- No auth — uses anonymous localStorage visitor ID

## In Progress
- None; awaiting review.

## Known Limitations
- Anatomy artwork is educational prototype art, not clinically verified.
- Full-body region coordinates still require human visual review after replacing
  artwork; zoom diagram centroids are test-covered against current artwork.
- Only 12 exercises have full video; others use photos/illustrations/target maps.
- External GitHub-hosted photo/RepDB media requires network.
- No formal privacy-policy page/legal identity configured yet—required before
  real marketing campaigns.
- No edge rate limiting yet; honeypots/validation implemented.

## Current Architecture
See `TRD.md`; core content is static/SSG, community forms are PostgreSQL-backed.

## Current Assets
See `ASSET_LICENSING.md`. Never add media without license inventory update.

## Next Recommended Steps
1. Deploy to `workout.easeur.com`; verify install prompt on real Android + iPhone.
2. Add formal privacy policy/company details before collecting campaign emails.
3. Configure `COMMUNITY_WEBHOOK_URL` only when Excel workflow is chosen.
4. Run a human visual QA matrix at 375/768/1440 widths.
5. Replace prototype anatomy with licensed clinical artwork behind same IDs.

## AI Handoff — Read First
1. `docs/README.md`
2. `docs/BUILD_STATE.md`
3. `docs/TRD.md`
4. `docs/DECISION_LOG.md` (latest decisions at bottom)
5. `docs/ASSET_LICENSING.md`
6. `docs/COMMUNITY_DATA.md`
7. `docs/ZOOM_AUDIT.md`
