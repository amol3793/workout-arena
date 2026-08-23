# PRD — Ease your Workout (V2.4)

## Product Vision
A free, public, installable web app at `workout.easeur.com` that helps people
understand muscles and find exercises that train them:

> Explore body → choose region → identify muscle → understand function → compare
> exercises/media → follow form instructions → return naturally to anatomy.

Ease your Workout is part of the Easeur product family. It is an educational
fitness/anatomy guide, not medical diagnosis or a generic workout tracker.

## Target Users
- Beginners learning what an exercise trains.
- Intermediate lifters comparing movements for a particular muscle.
- Coaches/educators needing clear visual and written references.
- Mobile users who want a one-tap Home Screen muscle guide.

## Current Product Scope
### Anatomy regions (all implemented)
Shoulder, Chest, Back, Biceps, Triceps, Forearms, Core, Glutes, Legs.

### Content
- 31 canonical muscles.
- 99 exercises.
- Dedicated regional zoom artwork with labels.
- Exercise media from verified sources: YMove video, public-domain
  free-exercise-db photos, attributed RepDB illustrations, and project-owned
  diagrams/target maps.

## Core User Journeys
1. **Explore:** Home → front/back body → region → zoom → muscle → exercises.
2. **Learn exercise:** Exercise → media tabs → steps/cues → Back to muscle/region.
3. **Install:** See value → Add to Home Screen → launch standalone web app.
4. **Contribute:** Footer → Suggestions & updates → feedback/bug/content report.
5. **Opt in:** Contact → explicit marketing consent → update list → unsubscribe.

## Functional Requirements
- Full body remains the homepage hero.
- Every region is available through both visual markers and HTML navigation.
- Every zoom uses dedicated artwork; callouts must point to canonical muscles.
- Selection uses color plus dot, outline/glow, text and focus—not color alone.
- Muscle detail explains what/where/function/how to train.
- Exercises support source filtering and multi-source detail tabs.
- Broken media gracefully falls back to another source or target map.
- Visible back links and breadcrumbs prevent navigation dead ends.
- Exercise pages must return to the exact region zoom + selected muscle state,
  not only to a static exercise-list page.
- Muscle/exercise search supports future catalog growth.
- Theme supports light/dark and persists preference.
- PWA supports Home Screen installation and offline app shell.
- Suggestions persist to PostgreSQL; optional webhook enables Excel automation.
- Marketing collection requires explicit consent and supports unsubscribe.

## UX Requirements
- Mobile-first, large touch targets, compact labels and no overlapping controls.
- Anatomy visually dominant; no promotional feature-grid clutter.
- Zoom labels use collision-aware placement and straight leader lines.
- Source badges show available Video / Photos / RepDB before opening an exercise.
- Install prompt is value-led, dismissible and hidden after installation.

## Accessibility Requirements
- Keyboard-operable markers/tabs/forms.
- Screen-reader labels and semantic headings/landmarks.
- List-based alternative to visual anatomy.
- Reduced-motion support.
- Adequate contrast in light and dark themes.
- Form errors/successes announced with status semantics.

## SEO / LLM Requirements
- Static/indexable region, muscle and exercise pages.
- Unique metadata, canonical URLs, breadcrumbs, sitemap, robots, OG/Twitter.
- Structured data: WebSite, WebApplication, ContactPage, ExercisePlan,
  VideoObject.
- `/llms.txt` recommends exact canonical entry points; `/llms-full.txt` exposes
  the complete catalog for answer engines.
- AI index is machine-discoverable, not a user-facing footer destination.

## Performance Requirements
- Optimized WebP anatomy, lazy exercise media, static generation.
- No 3D/WebGL engine yet.
- Do not load bulk exercise video on anatomy pages.
- Service worker caches only same-origin shell/art; licensed external media stays
  network-only.

## Content & Media Requirements
- Anatomically correct naming and beginner-friendly language.
- Do not claim clinical verification for prototype artwork.
- Do not use media with unclear provenance.
- Show attribution required by RepDB; retain YMove/free-exercise-db provenance.
- Never use RepDB art as generative-AI input.

## Community/Data Requirements
- Feedback email is optional and never silently added to marketing.
- Marketing email requires explicit recorded consent.
- Database is source of truth; webhook is optional delivery/mirroring.
- CSV export supports Excel; public read/list APIs are forbidden.
- Add formal privacy-policy/legal identity before real campaign launch.

## Out of Scope
Accounts/login, saved workouts, personalized plans, AI workout generation,
payments/subscriptions, social features, native app, clinical claims, full 3D.

## Success Criteria
A first-time user can select any region, identify a muscle, understand it, view
credible exercise references, follow form steps, return to anatomy, and optionally
install the app—without instructions or an account.
