import type { AppsLayout } from "./schema";

/*
 * Home screen layout. `icon` names a glyph in src/components/os/icons.tsx.
 * Items with `app` open that app (by hash); items with `href` open in a new tab.
 */
export const appsLayout = {
  // 2×2 block next to the "Work with me" widget
  block: [
    { id: "journey", label: "Journey", icon: "sprout", colors: ["#5ddb8e", "#11924f"], app: "journey" },
    { id: "expertise", label: "Expertise", icon: "sparkles", colors: ["#b98aff", "#6537e3"], app: "expertise" },
    { id: "platforms", label: "Platforms", icon: "layers", colors: ["#5fd5ff", "#0d7bde"], app: "platforms" },
    { id: "reviews", label: "Reviews", icon: "star", colors: ["#ffc53d", "#f57800"], app: "reviews" },
  ],
  row: [
    { id: "youtube", label: "YouTube", icon: "play", colors: ["#ff6a5c", "#d81f26"], href: "https://www.youtube.com/@chetanpujari", brand: "youtube" },
    { id: "socials", label: "Socials", icon: "folder", colors: ["#ffffff", "#ffffff"], app: "socials" },
    { id: "projects", label: "Projects", icon: "rocket", colors: ["#ff8466", "#e3312c"], app: "projects" },
    { id: "settings", label: "Settings", icon: "toggles", colors: ["#7b8cad", "#3a4865"], face: "light", app: "settings" },
  ],
  links: [
    { id: "linkedin", label: "LinkedIn", icon: "briefcase", colors: ["#0A66C2", "#0A66C2"], href: "https://www.linkedin.com/in/chetan-pujari-ai", brand: "linkedin" },
    { id: "x", label: "X", icon: "at", colors: ["#000000", "#000000"], href: "https://x.com/Chetanpujari51", brand: "x" },
  ],
  dock: [
    { id: "courses", label: "Courses", icon: "cap", colors: ["#5c9dff", "#2344df"], app: "courses" },
    { id: "blog", label: "Blog", icon: "nib", colors: ["#ffaa5c", "#f2581c"], app: "blog" },
    { id: "services", label: "Services", icon: "bolt", colors: ["#ffe36a", "#ff9d0a"], face: "ink", app: "services" },
    { id: "contact", label: "Contact", icon: "plane", colors: ["#5be4cd", "#0a9487"], app: "contact" },
  ],
  titles: {
    courses: "Courses",
    journey: "Journey",
    expertise: "Expertise",
    platforms: "Platforms",
    projects: "Projects",
    blog: "Blog",
    reviews: "Reviews",
    services: "Services",
    contact: "Contact",
    settings: "Settings",
    socials: "Socials",
    ask: "Ask Chetan",
  },
} satisfies AppsLayout;

/** Optional AI app, shown only when NEXT_PUBLIC_ENABLE_ASK=true */
export const askApp = {
  id: "ask",
  label: "Ask Chetan",
  icon: "chat",
  colors: ["#7ef0c0", "#1aa67a"] as [string, string],
  app: "ask" as const,
};
