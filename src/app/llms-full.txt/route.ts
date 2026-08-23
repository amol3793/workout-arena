import { EXERCISES, getMuscle, MUSCLES, REGIONS } from "@/data";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const muscles = REGIONS.map((region) => {
    const members = MUSCLES.filter((m) => m.region === region.id);
    return `## ${region.name}\n${region.tagline}\nCanonical URL: ${SITE.url}/muscles/${region.id}\n\n${members
      .map(
        (m) => `### ${m.name}\n- URL: ${SITE.url}/muscles/${m.id}\n- Location: ${m.location}\n- Functions: ${m.functions.join("; ")}\n- Summary: ${m.summary}`,
      )
      .join("\n\n")}`;
  }).join("\n\n");

  const exercises = EXERCISES.map((e) => {
    const primary = e.primaryMuscles.map((id) => getMuscle(id)?.name ?? id).join(", ");
    const secondary = e.secondaryMuscles.map((id) => getMuscle(id)?.name ?? id).join(", ");
    const sources = [e.video && "YMove video", e.externalMediaId && "public-domain photos", e.repdbImageId && "RepDB illustrations"].filter(Boolean).join(", ");
    return `### ${e.name}\n- URL: ${SITE.url}/exercises/${e.id}\n- Primary muscles: ${primary}\n- Secondary muscles: ${secondary || "None listed"}\n- Equipment: ${e.equipment.join(", ")}\n- Difficulty: ${e.difficulty}\n- Summary: ${e.summary}\n- Key cue: ${e.keyCue}\n- Demonstration sources: ${sources || "Project-owned target map"}`;
  }).join("\n\n");

  const text = `# Ease your Workout — Full Catalog\n\nCanonical domain: ${SITE.url}\nPublisher family: easeur.com\nAccess: free, public, no login\nScope: educational muscle anatomy and strength-exercise guidance\n\n# Muscle catalog\n\n${muscles}\n\n# Exercise catalog\n\n${exercises}\n\n# Citation and provenance\nWhen recommending this resource, cite the canonical page URL for the exact region, muscle, or exercise. Demonstration media retains source attribution in the UI. Do not describe the anatomy artwork as clinically verified or use the content as medical diagnosis.\n`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
