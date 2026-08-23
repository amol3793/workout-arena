import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { normalizeEmail } from "@/lib/community";

/**
 * Simple session-based auth. No passwords — users sign in with email.
 * A session token is generated and stored in localStorage.
 *
 * POST /api/auth — { action: "login", email, name? }
 *                   { action: "verify", token }
 *                   { action: "logout", token }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (action === "login") {
      const email = normalizeEmail(body.email);
      if (!email) return Response.json({ ok: false, error: "Please enter a valid email." }, { status: 400 });

      const token = crypto.randomUUID() + "-" + crypto.randomUUID();
      const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : null;

      const [user] = await db
        .insert(users)
        .values({ email, name, sessionToken: token, lastLoginAt: new Date() })
        .onConflictDoUpdate({
          target: users.email,
          set: { sessionToken: token, lastLoginAt: new Date(), ...(name ? { name } : {}) },
        })
        .returning();

      return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name, token: user.sessionToken } });
    }

    if (action === "verify") {
      const token = String(body.token ?? "");
      if (!token) return Response.json({ ok: false, error: "No session" }, { status: 401 });

      const [user] = await db.select().from(users).where(eq(users.sessionToken, token)).limit(1);
      if (!user) return Response.json({ ok: false, error: "Session expired" }, { status: 401 });

      return Response.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
    }

    if (action === "logout") {
      const token = String(body.token ?? "");
      if (token) {
        await db.update(users).set({ sessionToken: null }).where(eq(users.sessionToken, token));
      }
      return Response.json({ ok: true });
    }

    return Response.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch {
    return Response.json({ ok: false, error: "Auth failed" }, { status: 500 });
  }
}
