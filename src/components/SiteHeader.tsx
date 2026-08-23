import Link from "next/link";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/", label: "Explore" },
  { href: "/workout", label: "My Workout" },
  { href: "/coach", label: "AI Coach" },
  { href: "/progress", label: "Progress" },
];

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto grid min-h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1 px-2 py-1.5 sm:min-h-[72px] sm:gap-3 sm:px-6 lg:px-8">
        <Logo compact />
        <nav aria-label="Primary" className="flex min-w-0 items-center justify-center gap-0 sm:gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="site-nav-link rounded-lg px-1.5 py-1.5 text-[9px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 min-[390px]:px-2 min-[390px]:text-[10px] sm:px-3 sm:py-2 sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 justify-self-end sm:gap-2">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
