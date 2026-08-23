import { PRODUCT_CONFIG } from "@/lib/productConfig";
import { generateText } from "ai";
import { db } from "@/db";
import { userProfiles, workoutPlans, type WorkoutPlanData } from "@/db/schema";
import { getAIProvider, AI_MODEL, isAIConfigured } from "@/lib/ai/config";
import { SYSTEM_PROMPT_PLANNER } from "@/lib/ai/prompts";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  if (!PRODUCT_CONFIG.features.userWorkspace) return Response.json({ ok: false, error: "This V2 feature is disabled." }, { status: 404 });
  try {
    if (!isAIConfigured()) {
      return Response.json({
        ok: false,
        error: "AI is not configured. Set OPENAI_API_KEY in environment variables.",
      }, { status: 503 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const visitorId = String(body.visitorId ?? "");
    if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

    // Get user profile
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.visitorId, visitorId)).limit(1);
    if (!profile) return Response.json({ ok: false, error: "Please set up your fitness profile first." }, { status: 400 });

    const provider = getAIProvider()!;
    const userContext = `
Goal: ${profile.goal}
Experience: ${profile.experience}
Training days/week: ${profile.trainingDays}
Workout duration: ${profile.workoutDuration} minutes
Equipment: ${profile.equipment.length ? profile.equipment.join(", ") : "Full gym"}
Training style: ${profile.trainingStyle || "No preference"}
Muscle priorities: ${profile.musclePriorities?.length ? profile.musclePriorities.join(", ") : "Balanced"}
${body.additionalNotes ? `Additional notes: ${body.additionalNotes}` : ""}`;

    const result = await generateText({
      model: provider(AI_MODEL),
      system: SYSTEM_PROMPT_PLANNER,
      prompt: `Create a personalized weekly workout plan for this user:\n${userContext}\n\nRespond with valid JSON only. Schema: { "weeklySchedule": [{ "dayLabel": string, "focus": string, "warmup": string, "exercises": [{ "exerciseId": string, "name": string, "targetMuscle": string, "sets": number, "reps": string, "restSeconds": number, "notes": string }], "estimatedMinutes": number }], "aiNotes": string }`,
    });

    let planData: WorkoutPlanData;
    try {
      const cleaned = result.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      planData = JSON.parse(cleaned);
    } catch {
      return Response.json({ ok: false, error: "AI generated an invalid plan. Please try again." }, { status: 500 });
    }

    // Deactivate old plans
    await db.update(workoutPlans).set({ isActive: false }).where(eq(workoutPlans.visitorId, visitorId));

    // Save new plan
    const [saved] = await db.insert(workoutPlans).values({
      visitorId,
      name: `${profile.goal} Plan`,
      planData,
      isActive: true,
    }).returning();

    return Response.json({ ok: true, plan: saved });
  } catch (e) {
    console.error("Plan generation error:", e);
    return Response.json({ ok: false, error: "Failed to generate plan. Please try again." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const visitorId = url.searchParams.get("visitorId");
  if (!visitorId) return Response.json({ ok: false, error: "Missing visitor ID" }, { status: 400 });

  const [plan] = await db.select().from(workoutPlans)
    .where(eq(workoutPlans.visitorId, visitorId))
    .orderBy(workoutPlans.createdAt)
    .limit(1);

  return Response.json({ ok: true, plan: plan ?? null });
}
