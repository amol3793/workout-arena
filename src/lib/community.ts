export type CommunityEvent =
  | "feedback.created"
  | "subscriber.subscribed"
  | "subscriber.unsubscribed";

/**
 * Optional event bridge for future Excel / Power Automate / Zapier / Make sync.
 * Database writes happen first; a failed webhook never loses the submission.
 *
 * Environment:
 * - COMMUNITY_WEBHOOK_URL: receiver URL
 * - COMMUNITY_WEBHOOK_SECRET: optional Bearer token
 */
export async function dispatchCommunityEvent(
  event: CommunityEvent,
  data: Record<string, unknown>,
): Promise<void> {
  const url = process.env.COMMUNITY_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.COMMUNITY_WEBHOOK_SECRET
          ? { Authorization: `Bearer ${process.env.COMMUNITY_WEBHOOK_SECRET}` }
          : {}),
      },
      body: JSON.stringify({ event, occurredAt: new Date().toISOString(), data }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Deliberately swallow: PostgreSQL is the source of truth. Webhook sync can
    // be retried later from an export/backfill script.
  }
}

export const MARKETING_CONSENT_TEXT =
  "I agree to receive occasional Easeur product launches and feature updates by email. I can unsubscribe at any time.";

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}
