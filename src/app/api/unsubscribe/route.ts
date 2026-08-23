import { db } from "@/db";
import { marketingSubscribers } from "@/db/schema";
import { dispatchCommunityEvent, normalizeEmail } from "@/lib/community";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = normalizeEmail(body.email);
    if (!email) {
      return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }

    await db
      .update(marketingSubscribers)
      .set({ status: "unsubscribed", consent: false, updatedAt: new Date() })
      .where(eq(marketingSubscribers.email, email));

    await dispatchCommunityEvent("subscriber.unsubscribed", { email });
    // Always return success to avoid revealing whether an address is subscribed.
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Please try again." }, { status: 500 });
  }
}
