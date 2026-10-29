import { TINT, Tile, type GlyphName } from "@/components/ui/grouped";

/** Each service's tile: one glyph on one accent, used in Services and wherever a service is listed. */
const LOOK: Record<string, { glyph: GlyphName; tint: string }> = {
  courses: { glyph: "cap", tint: TINT.blue },
  websites: { glyph: "globe", tint: TINT.indigo },
  automation: { glyph: "sparkle", tint: TINT.purple },
  branding: { glyph: "megaphone", tint: TINT.orange },
  video: { glyph: "video", tint: TINT.red },
  design: { glyph: "pen", tint: TINT.teal },
};

export function ServiceTile({ id, size }: { id: string; size?: number }) {
  const look = LOOK[id] ?? { glyph: "sparkle", tint: TINT.gray };
  return <Tile glyph={look.glyph} tint={look.tint} size={size} />;
}
