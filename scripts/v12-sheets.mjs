// v12 before/after sheets from scripts/v12-shots.mjs frames: docs/v12/sheets/<screen>.jpg, top row
// before, bottom row after; columns 390 light, 390 dark, 390 light with Larger text, 1440 light.
// Usage: node scripts/v12-sheets.mjs [dir=docs/v12]
import { access, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const dir = process.argv[2] ?? "docs/v12";
const H = 900;
const gap = 20;
const COLUMNS = ["390-light", "390-dark", "390-light-large", "1440-light"];
const exists = (f) => access(f).then(() => true, () => false);
await mkdir(join(dir, "sheets"), { recursive: true });

const screens = [...new Set((await readdir(join(dir, "after"))).map((f) => f.replace(/-(390|1440)-.*$/, "")))];
for (const screen of screens) {
  const rows = [];
  for (const side of ["before", "after"]) {
    const files = COLUMNS.map((c) => join(dir, side, `${screen}-${c}.png`));
    const imgs = [];
    for (const f of files) if (await exists(f)) imgs.push(await sharp(f).resize({ height: H }).toBuffer({ resolveWithObject: true }));
    rows.push(imgs);
  }
  const width = Math.max(...rows.map((r) => r.reduce((w, { info }) => w + info.width + gap, gap)));
  const composite = rows.flatMap((imgs, row) => {
    let left = gap;
    return imgs.map(({ data, info }) => {
      const c = { input: data, left, top: gap + row * (H + gap) };
      left += info.width + gap;
      return c;
    });
  });
  const out = join(dir, "sheets", `${screen}.jpg`);
  await sharp({ create: { width, height: gap + 2 * (H + gap), channels: 3, background: "#808080" } }).composite(composite).jpeg({ quality: 78 }).toFile(out);
  console.log(out);
}
