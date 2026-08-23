"use client";

import Link from "next/link";
import { Component, type ReactNode } from "react";

/**
 * Generic UI error boundary: if any interactive island crashes, the user gets
 * a graceful fallback with navigation — never a blank/broken page.
 */
export class ErrorBoundary extends Component<
  { children: ReactNode; fallbackLabel?: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl bg-white p-6 text-center ring-1 ring-slate-200">
          <p className="text-sm font-semibold text-slate-800">
            {this.props.fallbackLabel ?? "Something didn't load correctly."}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            You can keep exploring without the interactive view.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/" className="text-sm font-semibold text-blue-700 hover:underline">
              ← Back to explorer
            </Link>
            <Link href="/exercises" className="text-sm font-semibold text-blue-700 hover:underline">
              Browse exercises
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
