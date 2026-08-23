import { db } from "@/db";
import { feedbackSubmissions } from "@/db/schema";
import { dispatchCommunityEvent, normalizeEmail } from "@/lib/community";

const TYPES = new Set(["suggestion", "bug", "content", "other"]);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot: bots tend to fill hidden fields. Return success without storing.
    if (typeof body.website === "string" && body.website.trim()) {
      return Response.json({ ok: true });
    }

    const type = typeof body.type === "string" && TYPES.has(body.type)
      ? body.type
      : "suggestion";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : null;
    const email = body.email ? normalizeEmail(body.email) : null;
    const pagePath = typeof body.pagePath === "string" ? body.pagePath.trim().slice(0, 500) : null;

    if (message.length < 10 || message.length > 3000) {
      return Response.json(
        { ok: false, error: "Please enter between 10 and 3,000 characters." },
        { status: 400 },
      );
    }
    if (body.email && !email) {
      return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    const [created] = await db
      .insert(feedbackSubmissions)
      .values({ type, name: name || null, email, message, pagePath })
      .returning({ id: feedbackSubmissions.id, createdAt: feedbackSubmissions.createdAt });

    await dispatchCommunityEvent("feedback.created", {
      id: created.id,
      type,
      name,
      email,
      message,
      pagePath,
      createdAt: created.createdAt.toISOString(),
    });

    return Response.json({ ok: true, id: created.id });
  } catch {
    return Response.json(
      { ok: false, error: "We couldn't save that right now. Please try again." },
      { status: 500 },
    );
  }
}
