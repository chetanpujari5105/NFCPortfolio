"use client";

import { platforms } from "@content/platforms";
import { profile } from "@content/profile";
import { AppHeader, AppScreen, ListGroup, ListRow, SectionTitle } from "@/components/ui/app-shell";

const TILE_COLORS = ["#a435f0", "#00b67a", "#2b9348", "#f2994a", "#ec6608", "#e62117"];

export default function PlatformsApp() {
  return (
    <AppScreen>
      <AppHeader
        title="Platforms"
        subtitle={`${profile.stats.platforms}+ platforms · ${profile.stats.countries}+ countries`}
      />

      <ListGroup header="Teach with me">
        {platforms.primary.map((p, i) => (
          <ListRow
            key={p.name}
            href={p.url ?? undefined}
            leading={
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-[10px] text-[15px] font-bold text-white"
                style={{ background: TILE_COLORS[i % TILE_COLORS.length] }}
              >
                {p.logo}
              </span>
            }
            title={p.name}
            subtitle={p.note ?? (p.url ? "Open profile" : undefined)}
          />
        ))}
      </ListGroup>

      <SectionTitle>Also available via Packt distribution</SectionTitle>
      <ul className="flex flex-wrap gap-1.5 px-1">
        {platforms.distribution.map((d) => (
          <li key={d} className="rounded-full bg-app-group px-3 py-1.5 text-[13px] font-medium text-app-secondary">
            {d}
          </li>
        ))}
      </ul>
    </AppScreen>
  );
}
