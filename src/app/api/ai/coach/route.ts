import { PRODUCT_CONFIG } from "@/lib/productConfig";
import { streamText } from "ai";
import { db } from "@/db";
import { userProfiles, workoutPlans, workoutSessions, workoutSets } from "@/db/schema";
import { getAIProvider, AI_MODEL, isAIConfigured } from "@/lib/ai/config";
import { SYSTEM_PROMPT_COACH } from "@/lib/ai/prompts";
import { eq, desc } from "drizzle-orm";

export async function POST(request: Request) {
  if (!PRODUCT_CONFIG.features.userWorkspace) return Response.json({ ok: false, error: "This V2 feature is disabled." }, { status: 404 });
  if (!isAIConfigured()) {
    return Response.json({
      ok: false,
      error: "AI is not configured. Set OPENAI_API_KEY in environment variables.",
    }, { status: 503 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const visitorId = String(body.visitorId ?? "");
  const message = String(body.message ?? "");
  if (!message) return Response.json({ ok: false, error: "Empty message" }, { status: 400 });

  // Gather user context
  const [profile] = visitorId
    ? await db.select().from(userProfiles).where(eq(userProfiles.visitorId, visitorId)).limit(1)
    : [null];
  const [plan] = visitorId
    ? await db.select().from(workoutPlans).where(eq(workoutPlans.visitorId, visitorId)).orderBy(desc(workoutPlans.createdAt)).limit(1)
    : [null];
  const recentSessions = visitorId
    ? await db.select().from(workoutSessions).where(eq(workoutSessions.visitorId, visitorId)).orderBy(desc(workoutSessions.startedAt)).limit(5)
    : [];

  let contextBlock = "";
  if (profile) {
    contextBlock += `\nUSER PROFILE: Goal=${profile.goal}, Experience=${profile.experience}, Days/week=${profile.trainingDays}, Duration=${profile.workoutDuration}min, Equipment=${(profile.equipment as string[]).join(",") || "full gym"}`;
  }
  if (plan) {
    const days = (plan.planData as { weeklySchedule?: { dayLabel: string; focus: string }[] })?.weeklySchedule;
    if (days) contextBlock += `\nACTIVE PLAN: ${days.map((d) => d.dayLabel).join(", ")}`;
  }
  if (recentSessions.length) {
    contextBlock += `\nRECENT SESSIONS: ${recentSessions.map((s) => `${s.dayLabel ?? "Session"} on ${s.startedAt.toISOString().slice(0, 10)}`).join(", ")}`;
  }

  const provider = getAIProvider()!;
  const result = streamText({
    model: provider(AI_MODEL),
    system: SYSTEM_PROMPT_COACH + (contextBlock ? `\n\nCURRENT USER CONTEXT:${contextBlock}` : ""),
    messages: [{ role: "user", content: message }],
  });

  return result.toTextStreamResponse();
}
