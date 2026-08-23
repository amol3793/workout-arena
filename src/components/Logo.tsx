import Link from "next/link";

/**
 * Easeur-family product logo.
 * Two independently maintained assets are used so contrast/color can be tuned
 * per theme without runtime SVG mutation:
 * - public/brand/ease-your-workout-light.svg
 * - public/brand/ease-your-workout-dark.svg
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  const height = compact ? 52 : 64;
  const width = Math.round(height * (116 / 96));

  return (
    <Link
      href="/"
      className="easeur-logo-link flex shrink-0 items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label="Ease your Workout — home"
    >
      <img
        src="/brand/ease-your-workout-light.svg"
        alt="Ease Your Workout"
        width={width}
        height={height}
        className="easeur-logo easeur-logo-light block"
        draggable={false}
      />
      <img
        src="/brand/ease-your-workout-dark.svg"
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className="easeur-logo easeur-logo-dark hidden"
        draggable={false}
      />
    </Link>
  );
}
