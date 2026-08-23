# FEATURE_LIST

Statuses: [IMPLEMENTED] [PLANNED] [FUTURE] [REJECTED]

## Brand / Theme
- [IMPLEMENTED] workout.easeur.com identity, light/dark logos, OG/icons.
- [IMPLEMENTED] Persistent light/dark theme with system fallback.

## Anatomy
- [IMPLEMENTED] Front/back body with 9 region markers.
- [IMPLEMENTED] Shoulder, Chest, Back, Biceps, Triceps, Forearms, Core, Glutes, Legs.
- [IMPLEMENTED] Dedicated regional art + pixel-derived muscle markers.
- [IMPLEMENTED] Collision-aware leader labels; non-overlapping shoulder groups.
- [IMPLEMENTED] 31 canonical muscles + renderer abstraction.
- [FUTURE] Licensed clinical artwork / optional 3D renderer.

## Exercises / Media
- [IMPLEMENTED] 99 searchable exercises.
- [IMPLEMENTED] 12 YMove videos, 36 public-domain photo sets, 96 RepDB sets.
- [IMPLEMENTED] Provider source filters/badges and multi-source gallery.
- [IMPLEMENTED] Movement diagrams + exercise-aware target maps.
- [IMPLEMENTED] Sourced Do this tips + common mistakes for all exercises.
- [IMPLEMENTED] Graceful media fallback and reduced motion.
- [REJECTED] Unverified Free Exercise DB video variant.

## Navigation / Mobile
- [IMPLEMENTED] Breadcrumbs, BackLinks, region/muscle/exercise routes.
- [IMPLEMENTED] Context deep links restore region zoom + selected muscle.
- [IMPLEMENTED] Centered Explore/Muscles/Exercises/Connect header navigation.
- [IMPLEMENTED] Search, mobile sheets/chips, accessible touch targets.
- [IMPLEMENTED] PWA install card, native prompt, iOS instructions, shortcuts.
- [IMPLEMENTED] Offline app shell (same-origin assets only).

## Accessibility
- [IMPLEMENTED] Keyboard markers/tabs/forms, ARIA, focus, skip link.
- [IMPLEMENTED] Non-color states and reduced-motion support.
- [IMPLEMENTED] HTML/list alternatives to anatomy visuals.

## SEO / LLM Discovery
- [IMPLEMENTED] SSG HTML pages, canonical metadata, OG, sitemap, robots.
- [IMPLEMENTED] Breadcrumb, website, app, contact, exercise/video structured data.
- [IMPLEMENTED] `/llms.txt` + `/llms-full.txt` canonical indexes.

## Community / Marketing
- [IMPLEMENTED] Suggestions, bugs and content-correction form.
- [IMPLEMENTED] PostgreSQL review queue with status workflow.
- [IMPLEMENTED] Explicit-consent email updates; unique email + unsubscribe.
- [IMPLEMENTED] Optional webhook bridge for Excel/Power Automate/Zapier/Make.
- [IMPLEMENTED] Excel-compatible CSV export script.
- [PLANNED] Formal privacy policy and legal sender identity before campaigns.
- [FUTURE] Developer-only feedback dashboard (no public read API).

## AI Fitness Layer
- [IMPLEMENTED] User fitness profile (goal, experience, equipment, schedule).
- [IMPLEMENTED] AI workout planner — personalized weekly plan generation.
- [IMPLEMENTED] AI Coach — context-aware streaming chat with profile/plan/history.
- [IMPLEMENTED] "Ask AI" recommendation button on muscle and region pages.
- [IMPLEMENTED] Workout session and set logging API.
- [IMPLEMENTED] Progress dashboard with session history and volume stats.
- [IMPLEMENTED] Specialized AI prompts grounded in the real exercise database.
- [IMPLEMENTED] Graceful degradation when OPENAI_API_KEY is not configured.
- [PLANNED] Progressive overload analysis using logged workout history.
- [PLANNED] "Adjust today's workout" adaptation based on real-time context.
- [PLANNED] Post-workout AI analysis and insights.
- [PLANNED] Muscle training heatmap based on logged sessions.
- [FUTURE] AI form analysis, recovery intelligence, nutrition.

## Out of Scope
- [REJECTED] Login/accounts/payments for core experience.
- [FUTURE] Native app, wearable integrations.
