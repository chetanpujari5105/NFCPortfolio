// v11 review frames: Services and Platforms (and, when the build has them, a pushed Services detail and
// the Distribution partners list) at 390×844 (CSS phone) and 1440×900 (3D phone), light and dark, with
// Larger text off and on. Output is gitignored.
// Usage: node scripts/v11-shots.mjs <outDir> [base=http://localhost:3100]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const [outDir = "docs/v11/after", base = "http://localhost:3100"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });

const VIEWS = { 390: [390, 844], 1440: [1440, 900] };
const SCREENS = ["services", "services/websites", "platforms", "platforms/partners"];
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];
const shots = [];

for (const [view, [w, h]] of Object.entries(VIEWS))
  for (const theme of ["light", "dark"])
    for (const text of ["default", "large"]) {
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
        // An older build has no detail views: the hash falls back to the list, which is already shot
        if (hash.includes("/") && !(await page.locator("[data-push-view]").count())) continue;
        const file = join(outDir, `${hash.replace("/", "-")}-${view}-${theme}${text === "large" ? "-large" : ""}.png`);
        await writeFile(file, await page.screenshot());
        shots.push(file);
      }
      await ctx.close();
    }

await browser.close();
console.log(shots.join("\n"));
if (errors.length) console.log("page errors:\n" + [...new Set(errors)].join("\n"));
