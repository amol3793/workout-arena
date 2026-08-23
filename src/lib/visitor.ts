"use client";

const VISITOR_KEY = "easeur-workout-visitor-id";
const TOKEN_KEY = "easeur-session-token";

/**
 * Get the current session identifier for API calls.
 * Uses the auth session token if logged in, otherwise an anonymous UUID.
 */
export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  // Prefer authenticated session
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;
  // Fall back to anonymous visitor ID
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}
