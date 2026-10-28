// Contact sheets for a scripts/v6-shots.mjs capture: one JPEG per view (3D front, 3D home crop,
// 3D back, phone layout), the 4 finishes across and light/dark down, plus the icon sheets.
// Needs ffmpeg. Usage: node scripts/contact-sheet.mjs <shotsDir> [outDir=<shotsDir>/sheets]
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const [dir, out = join(dir ?? "", "sheets")] = process.argv.slice(2);
if (!dir) throw new Error("Usage: node scripts/contact-sheet.mjs <shotsDir> [outDir]");
mkdirSync(out, { recursive: true });

const FINISHES = ["burgundy", "electric", "graphite", "chai"];
const THEMES = ["light", "dark"];
// view → [cell width, crop] (crop trims the empty studio around the 3D phone)
const VIEWS = {
  "3d-front": [420, "crop=iw*0.36:ih:iw*0.32:0"],
  "3d-back": [420, "crop=iw*0.36:ih:iw*0.32:0"],
  "3d-home": [360, null],
  mobile: [300, null],
};

for (const [view, [w, crop]] of Object.entries(VIEWS)) {
  const files = THEMES.flatMap((t) => FINISHES.map((f) => join(dir, `${view}-${f}-${t}.png`)));
  if (!files.every(existsSync)) continue;
  const scaled = files.map((_, i) => `[${i}]${crop ? `${crop},` : ""}scale=${w}:-2[c${i}]`);
  const rows = THEMES.map((_, r) => `${FINISHES.map((__, c) => `[c${r * 4 + c}]`).join("")}hstack=4[r${r}]`);
  const graph = [...scaled, ...rows, "[r0][r1]vstack=2"].join(";");
  const target = join(out, `${view}.jpg`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", graph, "-q:v", "3", target]);
  console.log(target);
}

for (const t of THEMES) {
  const src = join(dir, `sheet-burgundy-${t}.png`);
  if (!existsSync(src)) continue;
  const target = join(out, `icons-${t}.jpg`);
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", src, "-vf", "scale=1500:-2", "-q:v", "2", target]);
  console.log(target);
}
