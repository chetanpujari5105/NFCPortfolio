// v10 review frames: the lock screen at 390×844 and 834×1112 (CSS phone) and 1440×900 (3D phone), and
// Journey (list and a pushed detail view) at 390×844 and 1440×900, light and dark. With reference images,
// also writes side-by-side compare sheets (gitignored: the references aren't ours).
// Usage: node scripts/v10-shots.mjs <outDir> [base=http://localhost:3100] [--refs a.jpg,b.webp]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2);
const refsAt = args.indexOf("--refs");
const refs = refsAt >= 0 ? args.splice(refsAt, 2)[1].split(",") : [];
const [outDir = "docs/v10/after", base = "http://localhost:3100"] = args;
await mkdir(outDir, { recursive: true });

const VIEWS = { 390: [390, 844], 834: [834, 1112], 1440: [1440, 900] };
// A fixed clock keeps frames comparable run to run
const FIXED = new Date("2026-10-29T09:41:00").getTime();
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];

async function open([w, h], theme, { locked, hash = "" }) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme, isMobile: w < 600, hasTouch: w < 900 });
  await ctx.addInitScript(
    ([t, locked, now]) => {
      if (!locked) sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.removeItem("pp-finish");
      const Real = Date;
      const offset = now - Real.now();
      Date = class extends Real {
        constructor(...a) {
          super(...(a.length ? a : [Real.now() + offset]));
        }
        static now() {
          return Real.now() + offset;
        }
      };
    },
    [theme, locked, FIXED],
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/" + hash, { waitUntil: "networkidle" });
  if (w >= 900) {
    await page.mouse.move(40, 40);
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
  }
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake"));
  await page.waitForTimeout(w >= 900 ? 2200 : 1400);
  return { ctx, page };
}

const shots = [];
async function save(name, png) {
  const file = join(outDir, `${name}.png`);
  await writeFile(file, png);
  shots.push(file);
}

for (const [view, size] of Object.entries(VIEWS))
  for (const theme of ["light", "dark"]) {
    const { ctx, page } = await open(size, theme, { locked: true });
    await save(`lock-${view}-${theme}`, await page.screenshot());
    await ctx.close();
  }

for (const view of ["390", "1440"])
  for (const theme of ["light", "dark"]) {
    const { ctx, page } = await open(VIEWS[view], theme, { locked: false, hash: "#journey" });
    await save(`journey-${view}-${theme}`, await page.screenshot());
    // Rows push a detail view (if this build has them): the story, and a year with a highlight
    for (const id of ["story", "2025"]) {
      const row = page.locator(`[data-journey-row="${id}"]`);
      if (!(await row.count())) continue;
      await row.click();
      await page.waitForTimeout(900);
      await save(`journey-${id}-${view}-${theme}`, await page.screenshot());
      await page.keyboard.press("Escape");
      await page.waitForTimeout(700);
    }
    await ctx.close();
  }
await browser.close();
console.log(errors.length ? `errors:\n${[...new Set(errors)].join("\n")}` : `${shots.length} frames written, no page errors`);

// Compare sheets: each reference, then our light and dark frames, all at one height
if (refs.length) {
  const H = 1100;
  const gap = 24;
  const sheet = async (name, files) => {
    const imgs = await Promise.all(files.map((f) => sharp(f).resize({ height: H }).toBuffer({ resolveWithObject: true })));
    let left = 0;
    const composite = imgs.map(({ data, info }) => {
      const c = { input: data, left, top: 0 };
      left += info.width + gap;
      return c;
    });
    const file = join(outDir, "compare", `${name}.jpg`);
    await mkdir(join(outDir, "compare"), { recursive: true });
    await sharp({ create: { width: left - gap, height: H, channels: 3, background: "#ffffff" } }).composite(composite).jpeg({ quality: 84 }).toFile(file);
    console.log(file);
  };
  for (const view of Object.keys(VIEWS)) await sheet(`lock-${view}`, [...refs, join(outDir, `lock-${view}-light.png`), join(outDir, `lock-${view}-dark.png`)]);
}
