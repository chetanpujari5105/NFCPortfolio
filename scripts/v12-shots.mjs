// v12 review frames: Courses, Blog, Expertise, Contact, Settings and Projects, each list and one
// pushed detail, at 390×844 (CSS phone; light and dark, Larger text off and on) and 1440×900 (3D
// phone; light and dark). Output is gitignored.
// Usage: node scripts/v12-shots.mjs <outDir> [base=http://localhost:3100] [screen,screen,…]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [outDir = "docs/v12/after", base = "http://localhost:3100", only] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });

const SCREENS = only?.split(",") ?? [
  "courses",
  "courses/google-veo",
  "blog",
  "blog/i-studied-dark-psychology-to-manipulate",
  "expertise",
  "expertise/ai",
  "contact",
  "settings",
  "settings/profile",
  "projects",
  "projects/sidekick",
];
const RUNS = [
  [390, 844, "light", "default"],
  [390, 844, "light", "large"],
  [390, 844, "dark", "default"],
  [390, 844, "dark", "large"],
  [1440, 900, "light", "default"],
  [1440, 900, "dark", "default"],
];
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];
const shots = [];

for (const [w, h, theme, text] of RUNS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme, isMobile: w < 600, hasTouch: w < 900 });
  await ctx.addInitScript(
    ([t, size]) => {
      sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.setItem("pp-text", size);
      localStorage.removeItem("pp-finish");
    },
    [theme, text],
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  for (const hash of SCREENS) {
    await page.goto(`${base}/#${hash}`, { waitUntil: "networkidle" });
    if (w >= 900) {
      await page.mouse.move(40, 40);
      await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
    }
    await page.waitForTimeout(w >= 900 ? 2200 : 1200);
    const file = join(outDir, `${hash.replace("/", "-")}-${w}-${theme}${text === "large" ? "-large" : ""}.png`);
    await writeFile(file, await page.screenshot());
    shots.push(file);
  }
  await ctx.close();
}

await browser.close();
console.log(`${shots.length} frames in ${outDir}`);
if (errors.length) console.log("page errors:\n" + [...new Set(errors)].join("\n"));
