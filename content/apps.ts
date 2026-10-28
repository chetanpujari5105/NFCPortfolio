import type { AppsLayout } from "./schema";

/*
 * Home screen layout. `icon` names a glyph in src/components/os/icons.tsx.
 * Items with `app` open that app (by hash); items with `href` open in a new tab.
 */
export const appsLayout = {
  // 2×2 block next to the "Work with me" widget
  block: [
    { id: "journey", label: "Journey", icon: "sprout", colors: ["#5cdb8b", "#16a156"], app: "journey" },
    { id: "expertise", label: "Expertise", icon: "sparkles", colors: ["#b48cff", "#7247ee"], app: "expertise" },
    { id: "platforms", label: "Platforms", icon: "layers", colors: ["#56cfff", "#1585ea"], app: "platforms" },
    { id: "reviews", label: "Reviews", icon: "star", colors: ["#ffcd3f", "#ff9500"], app: "reviews" },
  ],
  row: [
    { id: "youtube", label: "YouTube", icon: "play", colors: ["#ff6a5c", "#d81f26"], href: "https://www.youtube.com/@ImaginaryProgrammer", brand: "youtube" },
    { id: "socials", label: "Socials", icon: "folder", colors: ["#ffffff", "#ffffff"], app: "socials" },
    { id: "projects", label: "Projects", icon: "rocket", colors: ["#ff7b66", "#ea3a35"], app: "projects" },
    { id: "settings", label: "Settings", icon: "toggles", colors: ["#a5a7b0", "#686a74"], app: "settings" },
  ],
  links: [
    { id: "linkedin", label: "LinkedIn", icon: "briefcase", colors: ["#0A66C2", "#0A66C2"], href: "https://www.linkedin.com/in/chetan-pujari-ai", brand: "linkedin" },
    { id: "x", label: "X", icon: "at", colors: ["#000000", "#000000"], href: "https://x.com/Chetanpujari51", brand: "x" },
    { id: "udemy", label: "Udemy", icon: "cap", colors: ["#A435F0", "#A435F0"], href: "https://www.udemy.com/user/chetan-pujari-3/", brand: "udemy" },
    { id: "github", label: "GitHub", icon: "at", colors: ["#181717", "#181717"], href: "https://github.com/chetanpujari5105", brand: "github" },
  ],
  dock: [
    { id: "courses", label: "Courses", icon: "cap", colors: ["#52a2ff", "#205fea"], app: "courses" },
    { id: "blog", label: "Blog", icon: "nib", colors: ["#ffa152", "#f4621e"], app: "blog" },
    { id: "services", label: "Services", icon: "bolt", colors: ["#45454d", "#18181c"], app: "services" },
    { id: "contact", label: "Contact", icon: "plane", colors: ["#4fe0c7", "#0f9d8b"], app: "contact" },
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
