import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-lg place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">
          We couldn&apos;t find that muscle or exercise. Let&apos;s get you back to
          exploring.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/">Back to explorer</ButtonLink>
          <ButtonLink href="/exercises" variant="secondary">Browse exercises</ButtonLink>
        </div>
      </div>
    </div>
  );
}
