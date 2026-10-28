// Compresses screenshots of our own site into guide/images/*.jpg for the PDF.
// Usage: node guide/prepare-images.mjs <siteShotsDir> <templateShotsDir> [dryRunShotsDir]
// (shots dirs come from guide/capture.mjs; docs/v4 shots are already in the repo)
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const [site, tpl, dry] = process.argv.slice(2);
const out = "guide/images";
await mkdir(out, { recursive: true });

const jobs = [
  ["hero-front", "docs/v4/after/front-electric-dark.png", 1700],
  ["hero-mobile", "docs/v4/after/home-phone-dark.png", 640],
  ["back", "docs/v4/after/back-electric-dark.png", 1500],
  ["finish-graphite", "docs/v4/after/front-graphite-light.png", 1100],
  ["finish-chai", "docs/v4/after/front-chai-light.png", 1100],
  ["icons", "docs/v4/p3/icons-after.png", 1500],
  ["page2", join(site, "page2-dark.png"), 1500],
  ["app-courses", join(site, "app-courses-dark.png"), 1500],
  ["control", join(site, "control-dark.png"), 1500],
  ["mobile-lock", join(site, "mobile-lock-dark.png"), 640],
  ["mobile-journey", join(site, "mobile-journey-light.png"), 640],
  ["template-back", join(tpl, "back-dark.png"), 1500],
  ["template-mobile", join(tpl, "mobile-home-light.png"), 640],
];
if (dry) jobs.push(["dryrun-mobile", join(dry, "mobile-home-light.png"), 640]);

for (const [name, src, width] of jobs) {
  if (!existsSync(src)) { console.log("skip (missing)", src); continue; }
  const info = await sharp(src).resize({ width, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(join(out, `${name}.jpg`));
  console.log(name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
