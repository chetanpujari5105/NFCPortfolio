// Turns the iOS 18 App Icons Figma export (one SVG per icon, see public/icons/ios18/LICENSE.txt)
// into 180 px WebP tile faces. Each icon's own rounded clip is opened up to full bleed so the
// site's squircle mask is the only edge. Run: node scripts/ios18-icons.mjs <dir with ios18-*.svg>
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import sharp from "sharp";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/ios18-icons.mjs <export dir>");
const out = "public/icons/ios18";
const SIZE = 180;

/** Drops the corner radius from every 60×60 rect (the face and its clip path). */
const fullBleed = (svg) =>
  svg.replace(/<rect([^>]*?)width="60" height="60"([^>]*?) rx="[\d.]+"/g, '<rect$1width="60" height="60"$2');

const files = (await readdir(src)).filter((f) => /^ios18-.+\.svg$/.test(f));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: SIZE, height: SIZE }, deviceScaleFactor: 2 });
for (const file of files) {
  const svg = fullBleed(await readFile(path.join(src, file), "utf8")).replace(
    /<svg width="60" height="60"/,
    `<svg width="${SIZE}" height="${SIZE}"`,
  );
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  const png = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
  // A few anti-aliased seams at the art's edge (Maps) are filled from a blurred copy underneath,
  // so every face is opaque
  const under = await sharp(png).blur(3).toBuffer();
  const opaque = await sharp(under).composite([{ input: png }]).removeAlpha().toBuffer();
  const name = file.replace(/^ios18-/, "").replace(/\.svg$/, ".webp");
  await writeFile(
    path.join(out, name),
    await sharp(opaque).resize(SIZE, SIZE, { kernel: "lanczos3" }).webp({ quality: 88, effort: 6 }).toBuffer(),
  );
  console.log(name, `${((await stat(path.join(out, name))).size / 1024).toFixed(1)} KB`);
}
await browser.close();
