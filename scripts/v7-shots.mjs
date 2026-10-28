// v7 icon-pack review: the same frames from a build of each pack (NEXT_PUBLIC_ICON_PACK is baked in
// at build time, so the two run one after the other), side by side. Views 390×844 and 834×1112 (CSS
// phone) and 1440×900 (3D phone), light and dark, two finishes. Each compare image is one view ×
// finish: light original | light ios18 | dark original | dark ios18. Raw frames go to <outDir>/raw.
// Usage: node scripts/v7-shots.mjs <outDir> <original|ios18> [base=http://localhost:3100]
//        (once per build; the compare images are written when both packs' frames exist)
import { chromium } from "@playwright/test";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const [outDir = "docs/v7/compare", pack = "ios18", base = "http://localhost:3100"] = process.argv.slice(2);
const raw = join(outDir, "raw");
await mkdir(raw, { recursive: true });

const VIEWS = { 390: [390, 844], 834: [834, 1112], 1440: [1440, 900] };
const FINISHES = ["burgundy", "electric"];
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];

async function shot(base, [w, h], theme, finish) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme, isMobile: w < 600, hasTouch: w < 900 });
  await ctx.addInitScript(
    ([t, f]) => {
      sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.setItem("pp-finish", f);
      localStorage.removeItem("pp-home-v2");
    },
    [theme, finish],
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  if (w >= 900) {
    await page.mouse.move(40, 40);
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
  }
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake"));
  await page.waitForTimeout(w >= 900 ? 2000 : 1200);
  const png = await page.screenshot();
  await ctx.close();
  return png;
}

const frame = (pk, view, finish, theme) => join(raw, `${pk}-${view}-${finish}-${theme}.png`);
for (const [view, size] of Object.entries(VIEWS))
  for (const finish of FINISHES)
    for (const theme of ["light", "dark"]) await writeFile(frame(pack, view, finish, theme), await shot(base, size, theme, finish));
await browser.close();
console.log(errors.length ? `errors:\n${[...new Set(errors)].join("\n")}` : `${pack}: frames written, no page errors`);

const have = await access(frame(pack === "ios18" ? "original" : "ios18", 1440, "electric", "dark")).then(() => true, () => false);
if (have) {
  for (const [view, [w, h]] of Object.entries(VIEWS)) {
    for (const finish of FINISHES) {
      const gap = 16;
      const order = ["light", "dark"].flatMap((t) => ["original", "ios18"].map((pk) => frame(pk, view, finish, t)));
      const composite = await Promise.all(
        order.map(async (f, i) => ({ input: await sharp(await readFile(f)).resize(w, h).toBuffer(), left: i * (w + gap), top: 0 })),
      );
      const file = join(outDir, `${view}-${finish}.jpg`);
      await sharp({ create: { width: 4 * w + 3 * gap, height: h, channels: 3, background: "#ffffff" } })
        .composite(composite)
        .jpeg({ quality: 82 })
        .toFile(file);
      console.log(file);
    }
  }
}
