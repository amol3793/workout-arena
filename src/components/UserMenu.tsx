"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

export function UserMenu() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:text-xs"
      >
        Sign in
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white ring-2 ring-white transition hover:bg-blue-700 sm:h-9 sm:w-9 sm:text-sm"
      title={`${user.name ?? user.email} — tap to manage`}
    >
      {(user.name ?? user.email).charAt(0).toUpperCase()}
    </Link>
  );
}
