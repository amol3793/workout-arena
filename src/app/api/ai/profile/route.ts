import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const visitorId = typeof body.visitorId === "string" ? body.visitorId : "";
    if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

    const profile = {
      visitorId,
      goal: String(body.goal ?? "general-fitness"),
      experience: String(body.experience ?? "beginner"),
      trainingDays: Number(body.trainingDays) || 3,
      workoutDuration: Number(body.workoutDuration) || 45,
      equipment: Array.isArray(body.equipment) ? body.equipment as string[] : [],
      trainingStyle: typeof body.trainingStyle === "string" ? body.trainingStyle : null,
      musclePriorities: Array.isArray(body.musclePriorities) ? body.musclePriorities as string[] : [],
      updatedAt: new Date(),
    };

    const [result] = await db
      .insert(userProfiles)
      .values(profile)
      .onConflictDoUpdate({ target: userProfiles.visitorId, set: profile })
      .returning();

    return Response.json({ ok: true, profile: result });
  } catch (e) {
    return Response.json({ ok: false, error: "Failed to save profile" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const visitorId = url.searchParams.get("visitorId");
  if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.visitorId, visitorId)).limit(1);
  return Response.json({ ok: true, profile: profile ?? null });
}
