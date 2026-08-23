import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ease your Workout",
    short_name: "Ease Workout",
    description:
      "Explore muscles and discover exercises with clear anatomy, videos, photos and step-by-step guidance.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#080f17",
    theme_color: "#101820",
    categories: ["fitness", "health", "education"],
    icons: [
      {
        src: "/brand/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Explore muscles",
        short_name: "Muscles",
        url: "/muscles",
        icons: [{ src: "/brand/app-icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Browse exercises",
        short_name: "Exercises",
        url: "/exercises",
        icons: [{ src: "/brand/app-icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
