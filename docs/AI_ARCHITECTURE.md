# AI_ARCHITECTURE — EaseurWorkout AI Fitness Layer

## Overview
The AI layer sits ON TOP of the existing Explore app. The Explore experience
(body → region → muscle → exercises) is completely preserved and unmodified.

## Architecture

```
User (no auth, anonymous visitor ID)
  ├─ /workout → Profile setup → AI plan generation → Weekly plan display
  ├─ /coach → Streaming AI chat with full user context
  ├─ /progress → Workout history + volume stats
  └─ Explore (existing) → "Ask AI" button on muscle/region pages
        ↓
  API routes (server-side only — secrets never exposed to client)
  ├─ /api/ai/profile (GET/POST)
  ├─ /api/ai/plan (GET/POST) — generates workout plan via AI
  ├─ /api/ai/coach (POST) — streaming chat with context injection
  └─ /api/ai/log (GET/POST) — workout session/set logging
        ↓
  AI Provider (Vercel AI SDK + OpenAI-compatible)
  ├─ System prompts embed the real exercise catalog
  ├─ User context (profile + plan + recent sessions) injected per request
  └─ Streaming responses for real-time coach interaction
        ↓
  PostgreSQL (Drizzle ORM)
  ├─ user_profiles — goals, experience, equipment
  ├─ workout_plans — AI-generated weekly schedules (JSON)
  ├─ workout_sessions — logged workout sessions
  ├─ workout_sets — individual set records (weight, reps, RPE)
  └─ ai_recommendations — stored recommendations for reference
```

## Key Design Decisions

### No authentication required
Uses a localStorage-generated UUID (`easeur-workout-visitor-id`). This means:
- Zero friction to start using AI features
- Data persists on the same device/browser
- No cross-device sync (acceptable for V3; future: optional login layer)

### AI prompts use the real exercise database
System prompts include the actual exercise catalog (IDs, names, muscles,
equipment, difficulty) so AI recommendations reference exercises the user can
find in the app. This avoids the "AI recommends an exercise that doesn't exist"
problem.

### Streaming for the coach
The AI Coach uses `streamText` → `toTextStreamResponse()` for real-time
character-by-character display. Profile, plan, and recent session data are
injected into the system prompt as context, not passed to the user.

### Structured plan output
The planner asks AI for JSON matching the `WorkoutPlanData` schema. The response
is parsed and stored in `workout_plans.planData`. If parsing fails, the user
gets a clear retry message.

### Graceful degradation
When `OPENAI_API_KEY` is not set:
- AI API routes return `503` with a descriptive message
- Client UI shows the message instead of breaking
- The entire Explore experience remains fully functional
- Profile setup and workout logging still work (DB only)

## Database Tables

| Table | Purpose | Key fields |
|---|---|---|
| `user_profiles` | Fitness goals, equipment, schedule | visitor_id (unique), goal, experience, training_days, equipment |
| `workout_plans` | AI-generated weekly plans | visitor_id, plan_data (JSONB), is_active |
| `workout_sessions` | Logged workout sessions | visitor_id, plan_id, day_label, started_at, completed_at |
| `workout_sets` | Individual set records | session_id, exercise_id, weight, reps, rpe, completed |
| `ai_recommendations` | Stored AI suggestions | visitor_id, type, exercise_id, content, reasoning |

## AI Prompt Specialization

| Prompt | Purpose | Key behavior |
|---|---|---|
| PLANNER | Generate weekly workout plans | Outputs structured JSON; matches equipment/experience |
| COACH | Answer training questions | References user data; concise; action-oriented |
| RECOMMEND | Exercise recommendations for a muscle | 3-5 exercises with reasoning |
| PROGRESS | Analyze workout history | 2-3 insights; references specific numbers |

## Configuration

```env
OPENAI_API_KEY=sk-...          # Required for AI features
AI_MODEL=gpt-4o-mini           # Default model (can use gpt-4o, gpt-3.5-turbo, etc.)
OPENAI_BASE_URL=               # Optional: Azure OpenAI or compatible provider
```

## Future Expansion Points

1. **Progressive overload** — query workout_sets by exercise to calculate
   weight/rep trends and suggest next progression
2. **Workout adaptation** — "Adjust today's workout" endpoint that modifies
   the active plan based on real-time constraints
3. **Post-workout analysis** — trigger after session completion to generate
   2-3 insights comparing to previous sessions
4. **Muscle heatmap** — aggregate workout_sets by primary muscle to render
   training frequency/volume/recovery status on the body visualization
5. **Auth layer** — optional login for cross-device sync; visitor_id becomes
   linked to an authenticated user without data loss

## Safety

- AI never gives medical diagnoses or claims medical appropriateness
- Pain/injury prompts trigger professional referral in system prompt
- Exercise recommendations reference only the verified database
- No PII is sent to the AI provider beyond the fitness profile
- API keys are server-side only; never exposed to the browser
