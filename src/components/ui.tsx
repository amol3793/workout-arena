import Link from "next/link";
import type { Difficulty } from "@/lib/anatomy/types";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  beginner: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  intermediate: "bg-amber-100 text-amber-800 ring-amber-200",
  advanced: "bg-rose-100 text-rose-800 ring-rose-200",
};

export function DifficultyBadge({ level }: { level: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${DIFFICULTY_STYLES[level]}`}
    >
      {level}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
      {children}
    </span>
  );
}

export function Pill({
  children,
  color = "#2563eb",
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
      <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} aria-hidden />
      {children}
    </span>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20",
    secondary:
      "bg-white text-slate-800 ring-1 ring-inset ring-slate-200 hover:bg-slate-50",
    ghost: "text-blue-700 hover:bg-blue-50",
  }[variant];
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${styles} ${className}`}
    >
      {children}
    </Link>
  );
}
