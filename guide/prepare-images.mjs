// Compresses screenshots of our own site or template into guide/images/*.jpg for the PDF.
// Usage: node guide/prepare-images.mjs <siteShotsDir> <templateShotsDir> [dryRunShotsDir] [v5ShotsDir] [v2ShotsDir]
// (since v2.0 the "site" shots are the template running its sample content too)
// (shots dirs come from guide/capture.mjs and guide/capture-v5.mjs; the icon sheet is already in docs/v4)
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const [site, tpl, dry, v5, v2] = process.argv.slice(2);
const out = "guide/images";
await mkdir(out, { recursive: true });

const jobs = [
  ["hero-front", join(site, "front-dark.png"), 1700],
  ["hero-mobile", join(site, "mobile-home-dark.png"), 640],
  ["back", join(site, "back-dark.png"), 1500],
  ["finish-graphite", join(site, "front-graphite-light.png"), 1100],
  ["finish-chai", join(site, "front-chai-light.png"), 1100],
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
if (v5)
  for (const [name, width] of [
    ["edit-mode", 640], ["remove-sheet", 640], ["app-library", 640], ["folder-new", 640], ["folder-socials", 640],
    ["fit-320x568", 520], ["fit-430x932", 640], ["fit-844x390", 1300],
  ])
    jobs.push([`v5-${name}`, join(v5, `${name}.png`), width]);

if (v2)
  for (const [name, file] of [["reviews", "phone-reviews"], ["projects", "phone-projects"], ["control-mobile", "phone-control-center"]])
    jobs.push([`v2-${name}`, join(v2, `${file}.png`), 640]);

for (const [name, src, width] of jobs) {
  if (!existsSync(src)) { console.log("skip (missing)", src); continue; }
  const info = await sharp(src).resize({ width, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(join(out, `${name}.jpg`));
  console.log(name, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
