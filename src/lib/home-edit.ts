import { profile } from "@content/profile";

import { paginate, TILES, type HomeLayout } from "./home";

/*
 * Home-screen editing helpers, needed only once a visitor starts arranging (they load with the
 * editor, not with the home screen).
 */

/** Folders formed by dropping one app on another take the name of what they share. */
const CATEGORY: Record<string, string> = {
  ...Object.fromEntries(profile.socials.map((s) => [s.id, "Social"])),
  courses: "Learn",
  blog: "Learn",
  platforms: "Learn",
  expertise: "Learn",
  journey: "About Me",
  reviews: "About Me",
  projects: "Work",
  services: "Work",
  contact: "Work",
  ask: "Work",
};

export function folderName(a: string, b: string) {
  const ca = CATEGORY[a];
  return ca && ca === CATEGORY[b] ? ca : "Folder";
}

/** Every tile that isn't on the home screen, in the dock or in a folder (the App Library). */
export function hiddenTiles(layout: HomeLayout) {
  const placed = new Set([...layout.grid, ...layout.dock, ...Object.values(layout.folders).flatMap((f) => f.items)]);
  return Object.keys(TILES).filter((id) => !placed.has(id));
}

/** Index in `grid` where a new 1×1 tile lands in the first free cell (a hole, else the end). */
export function firstFreeIndex(grid: string[], cols: number, rows: number) {
  const { placed } = paginate(grid, cols, rows);
  const taken = new Set(placed.flatMap((p) => {
    const cells: string[] = [];
    for (let y = p.row; y < p.row + p.h; y++) for (let x = p.col; x < p.col + p.w; x++) cells.push(`${p.page}:${y}:${x}`);
    return cells;
  }));
  const lastPage = placed.at(-1)?.page ?? 0;
  for (let page = 0; page <= lastPage; page++)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (taken.has(`${page}:${r}:${c}`)) continue;
        // The first item after this hole in reading order: insert before it
        const after = placed.findIndex((p) => p.page > page || (p.page === page && (p.row > r || (p.row === r && p.col > c))));
        return after === -1 ? grid.length : after;
      }
  return grid.length;
}
