import { PRODUCT_CONFIG } from "@/lib/productConfig";
import { db } from "@/db";
import { workoutSessions, workoutSets } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

/** Log a workout set or complete a session. */
export async function POST(request: Request) {
  if (!PRODUCT_CONFIG.features.userWorkspace || !PRODUCT_CONFIG.features.aiCoach) return Response.json({ ok: false, error: "This V2 feature is disabled." }, { status: 404 });
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const visitorId = String(body.visitorId ?? "");
    const action = String(body.action ?? "");

    if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

    if (action === "start-session") {
      const [session] = await db.insert(workoutSessions).values({
        visitorId,
        planId: typeof body.planId === "number" ? body.planId : null,
        dayLabel: typeof body.dayLabel === "string" ? body.dayLabel : null,
      }).returning();
      return Response.json({ ok: true, session });
    }

    if (action === "log-set") {
      const sessionId = Number(body.sessionId);
      if (!sessionId) return Response.json({ ok: false, error: "Missing session ID" }, { status: 400 });
      const [set] = await db.insert(workoutSets).values({
        sessionId,
        exerciseId: String(body.exerciseId ?? ""),
        setNumber: Number(body.setNumber) || 1,
        weight: body.weight != null ? Number(body.weight) : null,
        reps: body.reps != null ? Number(body.reps) : null,
        completed: body.completed !== false,
        rpe: body.rpe != null ? Number(body.rpe) : null,
      }).returning();
      return Response.json({ ok: true, set });
    }

    if (action === "complete-session") {
      const sessionId = Number(body.sessionId);
      if (!sessionId) return Response.json({ ok: false, error: "Missing session ID" }, { status: 400 });
      await db.update(workoutSessions)
        .set({ completedAt: new Date(), notes: typeof body.notes === "string" ? body.notes : null })
        .where(eq(workoutSessions.id, sessionId));
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch {
    return Response.json({ ok: false, error: "Logging failed" }, { status: 500 });
  }
}

/** Get workout history for a visitor. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const visitorId = url.searchParams.get("visitorId");
  if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

  const sessions = await db.select().from(workoutSessions)
    .where(eq(workoutSessions.visitorId, visitorId))
    .orderBy(desc(workoutSessions.startedAt))
    .limit(20);

  const sessionIds = sessions.map((s) => s.id);
  const sets = sessionIds.length
    ? await db.select().from(workoutSets)
        .where(eq(workoutSets.sessionId, sessionIds[0])) // most recent for now
    : [];

  return Response.json({ ok: true, sessions, recentSets: sets });
}
