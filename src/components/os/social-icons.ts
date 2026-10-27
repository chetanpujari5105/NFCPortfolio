import type { Social } from "@content/schema";

/** Original tiles for the Socials folder — generic glyphs, not the brands' logos. */
export const socialIcons: Record<Social["id"], { glyph: string; colors: [string, string] }> = {
  linkedin: { glyph: "briefcase", colors: ["#4aa3ff", "#0a5fc2"] },
  x: { glyph: "at", colors: ["#4a4a4f", "#0b0b0d"] },
  instagram: { glyph: "camera", colors: ["#ffb347", "#e1306c"] },
  "ai-instagram": { glyph: "cameraSpark", colors: ["#b18cff", "#e1306c"] },
  substack: { glyph: "envelope", colors: ["#ffa25c", "#ff5a1f"] },
  udemy: { glyph: "cap", colors: ["#b48cff", "#6a2fe0"] },
  youtube: { glyph: "play", colors: ["#ff6a5c", "#d81f26"] },
};

export const FOLDER_SOCIALS: Social["id"][] = ["linkedin", "x", "instagram", "ai-instagram", "substack", "udemy"];
