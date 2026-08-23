import type { MetadataRoute } from "next";
import { EXERCISES, MUSCLES, REGIONS } from "@/data";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/muscles", "/exercises", "/workout", "/coach", "/progress", "/contact"].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const regionRoutes = REGIONS.map((r) => ({
    url: `${SITE.url}/muscles/${r.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const muscleRoutes = MUSCLES.map((m) => ({
    url: `${SITE.url}/muscles/${m.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const exerciseRoutes = EXERCISES.map((e) => ({
    url: `${SITE.url}/exercises/${e.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...regionRoutes, ...muscleRoutes, ...exerciseRoutes];
}
