import type { MetadataRoute } from "next";

/** Installable: opens full screen like the phone it draws. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Chetan Pujari",
    short_name: "Chetan",
    description: "AI Educator · 400K+ students · 21+ platforms. A portfolio you use like a phone.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
