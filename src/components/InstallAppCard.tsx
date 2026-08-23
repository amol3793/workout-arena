"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function InstallAppCard() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const capture = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", done);
    };
  }, []);

  async function install() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      return;
    }
    if (isIOS()) {
      setShowIOS(true);
      return;
    }
    // Browsers without programmatic prompt: show universal guidance.
    setShowIOS(true);
  }

  if (installed || dismissed) return null;

  return (
    <>
      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="install-title">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-7">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" aria-hidden />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/brand/app-icon-192.png"
                alt=""
                width={64}
                height={64}
                className="h-16 w-16 shrink-0 rounded-2xl shadow-lg ring-1 ring-white/15"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  No app store needed
                </p>
                <h2 id="install-title" className="mt-1 text-xl font-bold sm:text-2xl">
                  Keep your muscle map one tap away.
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
                  Add Ease your Workout to your Home Screen. It opens full-screen,
                  stays up to date, and remembers your preferred theme.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2 sm:flex-col">
              <button
                type="button"
                onClick={install}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:flex-none"
              >
                <span aria-hidden>↓</span>
                Add to Home Screen
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="rounded-xl px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </section>

      {showIOS && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-slate-950/60 p-3 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="install-help-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 text-slate-900 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Save to your phone</p>
                <h2 id="install-help-title" className="mt-1 text-xl font-bold">Your workout guide, like an app</h2>
              </div>
              <button type="button" onClick={() => setShowIOS(false)} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500" aria-label="Close instructions">✕</button>
            </div>

            <ol className="mt-5 space-y-3">
              <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white">1</span>
                <span className="text-sm leading-relaxed"><strong>Open the browser menu.</strong> On iPhone/iPad, tap the Share icon <span className="font-bold">□↑</span>. On Android, tap <strong>⋮</strong>.</span>
              </li>
              <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 font-bold text-white">2</span>
                <span className="text-sm leading-relaxed">Choose <strong>Add to Home Screen</strong> or <strong>Install app</strong>.</span>
              </li>
              <li className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 font-bold text-white">✓</span>
                <span className="text-sm leading-relaxed">Look for the <strong>Ease your Workout</strong> icon beside your other apps.</span>
              </li>
            </ol>

            <button type="button" onClick={() => setShowIOS(false)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
