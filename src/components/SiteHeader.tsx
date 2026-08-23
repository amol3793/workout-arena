import Link from "next/link";
import { PRODUCT_CONFIG } from "@/lib/productConfig";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const PUBLIC_NAV = [
  { href: "/", label: "Explore" },
  { href: "/muscles", label: "Muscles" },
  { href: "/exercises", label: "Exercises" },
  { href: "/contact", label: "Connect" },
];

const USER_NAV = [
  { href: "/workout", label: "My Workout" },
  { href: "/progress", label: "Progress" },
  { href: "/coach", label: "AI Coach" },
];

export function SiteHeader() {
  const nav = PRODUCT_CONFIG.features.userWorkspace ? [...PUBLIC_NAV, ...USER_NAV] : PUBLIC_NAV;
  return (
    <header className="site-header sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <Logo compact />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            {PRODUCT_CONFIG.features.userWorkspace && <UserMenu />}
          </div>
        </div>
        <nav aria-label="Primary" className="site-nav-row mt-2 flex min-w-0 items-center gap-1 overflow-x-auto pb-0.5 sm:absolute sm:left-1/2 sm:top-1/2 sm:mt-0 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-visible">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav-link shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm">{item.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
