/*
 * Which faces the app tiles wear. `ios18` (the default here): the iOS 18 App Icons by David
 * Akhmedbayev, CC BY 4.0 (public/icons/ios18/LICENSE.txt, made by scripts/ios18-icons.mjs).
 * `original`: the site's own gradient-and-glyph set. The brand tiles keep their own face in either
 * mode, as does any app without an entry below.
 */
export const ICON_PACK: "ios18" | "original" = process.env.NEXT_PUBLIC_ICON_PACK === "original" ? "original" : "ios18";

/** App id → pack icon file, in public/icons/ios18 */
const IOS18: Record<string, string> = {
  courses: "books",
  journey: "maps",
  expertise: "tips",
  platforms: "app-store",
  reviews: "photos",
  projects: "files",
  settings: "settings",
  blog: "notes",
  services: "wallet",
  contact: "mail",
};

/** The pack's image for this app, or undefined when it keeps its glyph face. */
export function packIcon(id: string): string | undefined {
  const file = ICON_PACK === "ios18" ? IOS18[id] : undefined;
  return file && `/icons/ios18/${file}.webp`;
}

/** Every image the active pack draws (preloaded with the page). */
export const PACK_ICONS = ICON_PACK === "ios18" ? Object.values(IOS18).map((f) => `/icons/ios18/${f}.webp`) : [];
