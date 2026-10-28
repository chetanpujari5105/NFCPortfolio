// v6 icon review captures. For each theme × finish: the 3D phone (1440×900) front, a close crop of
// its home screen and its back; the phone layout (390×844); and an icon sheet with every home tile
// at 60 px and 180 px on that finish's wallpaper.
// Usage: node scripts/v6-shots.mjs <outDir> [baseUrl=http://localhost:3100] [--only=sheet,mobile,3d]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const only = (process.argv.find((a) => a.startsWith("--only="))?.slice(7) ?? "sheet,mobile,3d").split(",");
const [outDir = "docs/v6/shots", base = "http://localhost:3100"] = args;
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];
const THEMES = ["light", "dark"];
const FINISHES = ["burgundy", "electric", "graphite", "chai"];

async function open(ctxOptions, { theme, finish }) {
  const ctx = await browser.newContext(ctxOptions);
  await ctx.addInitScript(
    ([t, f]) => {
      sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.setItem("pp-finish", f);
    },
    [theme, finish],
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  return { ctx, page };
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true };

for (const theme of THEMES) {
  for (const finish of FINISHES) {
    const tag = `${finish}-${theme}`;
    if (only.includes("3d")) {
      const { ctx, page } = await open(desktop, { theme, finish });
      await page.mouse.move(40, 40);
      await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
      await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake"), null, { timeout: 10_000 });
      await page.waitForTimeout(1800);
      await page.screenshot({ path: join(outDir, `3d-front-${tag}.png`) });
      const box = await page.locator("[data-home-page='0']").first().boundingBox();
      const dock = await page.locator("[data-dock]").first().boundingBox();
      if (box && dock) {
        const y = box.y - 40;
        await page.screenshot({
          path: join(outDir, `3d-home-${tag}.png`),
          clip: { x: box.x - 12, y, width: box.width + 24, height: dock.y + dock.height + 16 - y },
        });
      }
      await page.getByRole("button", { name: "Flip the phone" }).click();
      await page.mouse.move(40, 40);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(outDir, `3d-back-${tag}.png`) });
      await ctx.close();
    }
    if (only.includes("mobile")) {
      const { ctx, page } = await open(mobile, { theme, finish });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: join(outDir, `mobile-${tag}.png`) });
      await ctx.close();
    }
    if (only.includes("sheet")) {
      const { ctx, page } = await open({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: 2 }, { theme, finish });
      await page.waitForTimeout(800);
      await page.evaluate(() => {
        const tiles = [...document.querySelectorAll("[data-home-page='0'] .icon-tile, [data-dock] .icon-tile")];
        const screen = document.querySelector(".phone-screen") ?? document.body;
        const bg = getComputedStyle(document.querySelector("[data-wallpaper]") ?? screen).backgroundImage;
        const sheet = document.createElement("div");
        sheet.className = document.documentElement.className;
        sheet.style.cssText = `position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;gap:32px;padding:32px;background:${bg && bg !== "none" ? bg : "var(--wall-1, #333)"};background-size:cover`;
        for (const size of [60, 180]) {
          const row = document.createElement("div");
          row.style.cssText = `display:flex;flex-wrap:wrap;gap:${size / 3}px ${size / 2.6}px;--icon:${size}px`;
          for (const t of tiles) {
            const cell = document.createElement("div");
            cell.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:5px";
            const label = t.closest("[data-nav]")?.querySelector(".icon-label");
            cell.append(t.cloneNode(true));
            if (label && size === 60) cell.append(label.cloneNode(true));
            row.append(cell);
          }
          sheet.append(row);
        }
        document.body.append(sheet);
      });
      await page.waitForTimeout(300);
      await page.screenshot({ path: join(outDir, `sheet-${tag}.png`) });
      await ctx.close();
    }
  }
}

await browser.close();
console.log(errors.length ? `errors:\n${[...new Set(errors)].join("\n")}` : "no console errors");
