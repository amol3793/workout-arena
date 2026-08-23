import type { Metadata } from "next";
import { BackLink } from "@/components/BackLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SITE } from "@/lib/site";
import { ContactForms } from "./ContactForms";

export const metadata: Metadata = {
  title: "Suggestions & updates",
  description:
    "Send product suggestions or anatomy corrections to the Ease your Workout developer, and optionally join consent-based Easeur launch updates.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Ease your Workout suggestions and updates",
    url: `${SITE.url}/contact`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Suggestions & updates" }]} />
      <BackLink href="/">Back to explorer</BackLink>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Built with its users</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Spot something? Shape what comes next.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg">
          Suggestions go into a maintainable developer review queue. Email updates
          are separate, optional, and require explicit consent.
        </p>
      </div>

      <ContactForms />
    </div>
  );
}
