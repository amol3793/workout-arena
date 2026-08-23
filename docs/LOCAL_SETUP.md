# LOCAL_SETUP — Run Outside Arena / After Download

Use this after exporting/downloading the project from Arena.ai.

## Requirements
- Node.js 20+ (Node 22 tested in Arena)
- npm 10+
- PostgreSQL 15+ reachable via `DATABASE_URL`
- Optional: psql CLI for manual inspection

## 1. Install dependencies
```bash
npm install
```

## 2. Environment variables
Create `.env` in the project root:
```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
NEXT_PUBLIC_SITE_URL=https://workout.easeur.com

# AI features — set an OpenAI-compatible API key to enable AI Coach and planner
# OPENAI_API_KEY=sk-...
# AI_MODEL=gpt-4o-mini (default)
# OPENAI_BASE_URL= (optional, for Azure OpenAI or compatible providers)

# Optional future integrations
# COMMUNITY_WEBHOOK_URL=https://...
# COMMUNITY_WEBHOOK_SECRET=...
```

Notes:
- `NEXT_PUBLIC_SITE_URL` controls canonicals/OG/LLM indexes.
- `COMMUNITY_WEBHOOK_*` is only needed if mirroring feedback/subscribers into
  Excel/Power Automate/Zapier/Make or another backend.

## 3. Create / prepare the database
Example local DB:
```bash
createdb app_db
```
Then apply schema:
```bash
npx drizzle-kit push
```
This creates:
- `feedback_submissions`
- `marketing_subscribers`

## 4. Regenerate the exercise catalog (optional but recommended)
The generated exercise file is committed, so this is only needed if you want to
refresh RepDB/free-exercise-db matches.
```bash
node scripts/import-repdb.mjs
```
This fetches RepDB + free-exercise-db directly from GitHub and rewrites:
- `src/data/generatedExercises.ts`

## 5. Start development
```bash
npm run dev
```
Open:
- `http://localhost:3000/`
- `http://localhost:3000/muscles`
- `http://localhost:3000/exercises`
- `http://localhost:3000/contact`

## 6. PWA / install testing
Dev mode is enough to test most UI, but install prompts behave more reliably in
production mode:
```bash
npm run build
npm run start
```
Check:
- `http://localhost:3000/manifest.webmanifest`
- `http://localhost:3000/sw.js`
- install prompt on Android/Chromium
- Share → Add to Home Screen on iPhone/iPad

## 7. Validate before committing
Run the same sequence Arena uses:
```bash
node --import tsx --test src/tests/*.test.ts
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```
Current expectation: **25 passing tests**.

## 8. Community data operations
### Export feedback/subscribers for Excel
```bash
node scripts/export-community.mjs
# outputs ./exports/feedback.csv and ./exports/subscribers.csv
```

### Manual SQL checks
```bash
psql "$DATABASE_URL" -c "select * from feedback_submissions order by created_at desc limit 10"
psql "$DATABASE_URL" -c "select * from marketing_subscribers order by updated_at desc limit 10"
```

## 9. Common maintenance tasks
### Change logo / theme assets
Edit:
- `public/brand/ease-your-workout-light.svg`
- `public/brand/ease-your-workout-dark.svg`
- `src/components/Logo.tsx`
- `src/app/globals.css`

### Change region labels / marker positions
Edit:
- `src/components/anatomy/hotspots.ts`
- `src/components/anatomy/FullBodyViewer.tsx`
- `src/components/anatomy/RegionDiagramViewer.tsx`
Then update `docs/ZOOM_AUDIT.md` and rerun tests.

### Replace anatomy artwork
Images live in `public/anatomy/`. If replaced:
1. Recalculate centroids / marker positions.
2. Update `REGION_DIAGRAMS` and any body hotspots.
3. Update `docs/ASSET_LICENSING.md` and `docs/ZOOM_AUDIT.md`.
4. Rerun the full validation sequence.

## 10. Files to read first
1. `docs/README.md`
2. `docs/BUILD_STATE.md`
3. `docs/TRD.md`
4. `docs/COMMUNITY_DATA.md`
5. `docs/ZOOM_AUDIT.md`

### Product version and datasource switches

The public anatomy explorer is **V1** by default. User accounts, workout plans,
progress tracking, and AI coaching are deliberately V2-only. Enable the V2
workspace with `NEXT_PUBLIC_PRODUCT_VERSION=v2`.

All external media and target-map sources are adapters behind `PRODUCT_CONFIG`.
Disable one or more without modifying exercise records by setting a comma-separated
`NEXT_PUBLIC_DISABLED_DATA_SOURCES` value, for example:

```bash
NEXT_PUBLIC_DISABLED_DATA_SOURCES=openGym,repdb,muscleMap
```

Available IDs: `ymove`, `freeExerciseDb`, `repdb`, `openGym`, `muscleMap`.
