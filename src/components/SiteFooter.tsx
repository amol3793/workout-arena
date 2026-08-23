import Link from "next/link";
import { PRODUCT_CONFIG } from "@/lib/productConfig";

export function SiteFooter() {
  const userLinks = PRODUCT_CONFIG.features.userWorkspace ? [
    ["/workout", "My Workout"], ["/progress", "Progress"], ["/coach", "AI Coach"],
  ] as const : [];
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Ease your Workout · part of <a href="https://easeur.com" className="font-semibold underline hover:text-slate-800">easeur.com</a></p>
          <nav aria-label="Footer" className="flex flex-wrap gap-3 sm:gap-4">
            {[["/", "Explore"], ["/muscles", "Muscles"], ["/exercises", "Exercises"], ["/contact", "Connect"], ...userLinks].map(([href, label]) => <Link key={href} href={href} className="hover:text-slate-800">{label}</Link>)}
          </nav>
        </div>
        <p className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-400">Educational anatomy guide — not medical advice. Media: YMove (royalty-free HD video), free-exercise-db (public-domain photos), and RepDB (attributed illustrations).</p>
      </div>
    </footer>
  );
}
