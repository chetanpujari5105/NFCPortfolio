// v10 before/after sheets from scripts/v10-shots.mjs frames: docs/v10/<name>.jpg, each one row of
// before light | after light | before dark | after dark (only our own frames, so these are committed).
// Usage: node scripts/v10-sheets.mjs [dir=docs/v10]
import { access } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = process.argv[2] ?? "docs/v10";
const H = 1000;
const gap = 20;
const exists = (f) => access(f).then(() => true, () => false);

async function sheet(name, files) {
  const have = [];
  for (const f of files) if (await exists(f)) have.push(f);
  if (!have.length) return;
  const imgs = await Promise.all(have.map((f) => sharp(f).resize({ height: H }).toBuffer({ resolveWithObject: true })));
  let left = 0;
  const composite = imgs.map(({ data, info }) => {
    const c = { input: data, left, top: 0 };
    left += info.width + gap;
    return c;
  });
  const file = join(dir, `${name}.jpg`);
  await sharp({ create: { width: left - gap, height: H, channels: 3, background: "#ffffff" } }).composite(composite).jpeg({ quality: 80 }).toFile(file);
  console.log(file);
}

const pair = (frame) => ["light", "dark"].flatMap((t) => ["before", "after"].map((s) => join(dir, s, `${frame}-${t}.png`)));
for (const view of ["390", "834", "1440"]) await sheet(`lock-${view}`, pair(`lock-${view}`));
for (const view of ["390", "1440"]) {
  await sheet(`journey-${view}`, pair(`journey-${view}`));
  await sheet(`journey-detail-${view}`, ["light", "dark"].flatMap((t) => ["story", "2025"].map((id) => join(dir, "after", `journey-${id}-${view}-${t}.png`))));
}
