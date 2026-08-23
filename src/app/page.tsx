import { Explorer } from "@/components/Explorer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallAppCard } from "@/components/InstallAppCard";
import { EXERCISES, MUSCLES, REGIONS } from "@/data";
import { SITE } from "@/lib/site";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: "Easeur",
          url: "https://easeur.com",
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE.url}/#app`,
        name: SITE.name,
        url: SITE.url,
        applicationCategory: "HealthApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser",
        installUrl: SITE.url,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          `Interactive anatomy across ${REGIONS.length} body regions`,
          `${MUSCLES.length} beginner-friendly muscle guides`,
          `${EXERCISES.length} exercises with video, photos, illustrations, or target maps`,
          "Installable on Android, iPhone, iPad, and desktop",
          "No login required",
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Ease your Workout.
            <span className="easeur-rainbow block">Train smarter.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-slate-600 sm:mt-4 sm:text-lg">
            Tap the body to zoom into a region, understand each muscle, and
            discover the exercises that train it. Pick any{" "}
            <span className="font-semibold text-slate-800">region</span>.
          </p>
        </div>
      </section>

      <section
        id="explorer"
        className="mx-auto mt-6 max-w-7xl scroll-mt-24 px-4 sm:mt-8 sm:px-6 lg:px-8"
        aria-label="Interactive muscle explorer"
      >
        <ErrorBoundary fallbackLabel="The interactive body didn't load. Browse muscles or exercises instead.">
          <Explorer />
        </ErrorBoundary>
      </section>

      <InstallAppCard />

      {/* How it works */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl font-bold text-slate-900">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: 1, t: "Explore the body", d: "See the full muscular system, front and back." },
            { n: 2, t: "Pick a region", d: "Zoom into shoulders, chest, back, arms, core or legs." },
            { n: 3, t: "Understand a muscle", d: "Learn what it does and where it sits." },
            { n: 4, t: "Discover exercises", d: "See clear, beginner-friendly demonstrations." },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
