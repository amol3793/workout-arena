import { db } from "@/db";
import { marketingSubscribers } from "@/db/schema";
import {
  dispatchCommunityEvent,
  MARKETING_CONSENT_TEXT,
  normalizeEmail,
} from "@/lib/community";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    if (typeof body.website === "string" && body.website.trim()) {
      return Response.json({ ok: true });
    }

    const email = normalizeEmail(body.email);
    const consent = body.consent === true;
    if (!email) {
      return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!consent) {
      return Response.json(
        { ok: false, error: "Please confirm that you want to receive Easeur updates." },
        { status: 400 },
      );
    }

    const now = new Date();
    const [subscriber] = await db
      .insert(marketingSubscribers)
      .values({
        email,
        consent: true,
        consentText: MARKETING_CONSENT_TEXT,
        source: typeof body.source === "string" ? body.source.slice(0, 120) : "contact-page",
        status: "subscribed",
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: marketingSubscribers.email,
        set: {
          consent: true,
          consentText: MARKETING_CONSENT_TEXT,
          status: "subscribed",
          updatedAt: now,
        },
      })
      .returning({ id: marketingSubscribers.id, updatedAt: marketingSubscribers.updatedAt });

    await dispatchCommunityEvent("subscriber.subscribed", {
      id: subscriber.id,
      email,
      consentText: MARKETING_CONSENT_TEXT,
      updatedAt: subscriber.updatedAt.toISOString(),
    });

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "We couldn't save that right now. Please try again." },
      { status: 500 },
    );
  }
}
