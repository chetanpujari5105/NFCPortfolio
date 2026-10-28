// Screenshots of the v5 features on our own template (never of any other site): home-screen
// editing, folders, the App Library and the home screen at several screen sizes.
// Usage: node guide/capture-v5.mjs <outDir> [baseUrl=http://localhost:3500]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const [outDir = "guide/shots-v5", base = "http://localhost:3500"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];

async function open(width, height, theme = "light") {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await ctx.addInitScript((t) => {
    sessionStorage.setItem("pp-unlocked", "1");
    sessionStorage.setItem("pp-banner", "1");
    localStorage.setItem("pp-theme", t);
  }, theme);
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake") && document.querySelector("[data-measured]"));
  await page.waitForTimeout(1500);
  return { ctx, page };
}

const tile = (key) => `[data-home-key="${key}"] [data-icon-tile], [data-dock-key="${key}"] [data-icon-tile]`;
async function center(page, key) {
  const box = await page.locator(tile(key)).first().boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
async function longPress(page, key) {
  const at = await center(page, key);
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await page.getByRole("button", { name: "Done", exact: true }).waitFor();
  await page.waitForTimeout(700);
}
const shot = (page, name) => page.screenshot({ path: join(outDir, `${name}.png`) });

// Edit mode → remove an app → App Library
{
  const { ctx, page } = await open(390, 844);
  await longPress(page, "journey");
  await shot(page, "edit-mode");
  await page.getByRole("button", { name: "Remove Platforms" }).click({ force: true });
  await page.waitForTimeout(700);
  await shot(page, "remove-sheet");
  await page.getByRole("button", { name: "Remove from Home Screen" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Add apps from the App Library" }).click({ force: true });
  await page.waitForTimeout(900);
  await shot(page, "app-library");
  await ctx.close();
}

// Drop one app on another and hold: a new folder, open and ready to rename
{
  const { ctx, page } = await open(390, 844);
  await longPress(page, "journey");
  const from = await center(page, "journey");
  const to = await center(page, "expertise");
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x + 8, from.y + 4, { steps: 2 });
  await page.mouse.move(to.x, to.y, { steps: 14 });
  await page.waitForTimeout(600);
  await page.mouse.up();
  await page.waitForTimeout(1400);
  await shot(page, "folder-new");
  await ctx.close();
}

// The Socials folder, outside edit mode
{
  const { ctx, page } = await open(390, 844, "dark");
  await page.getByRole("button", { name: "Open Socials folder", exact: true }).click();
  await page.waitForTimeout(1100);
  await shot(page, "folder-socials");
  await ctx.close();
}

// The same home screen at other sizes: a small phone, a large phone, a phone on its side
for (const [w, h] of [[320, 568], [430, 932], [844, 390]]) {
  const { ctx, page } = await open(w, h);
  await shot(page, `fit-${w}x${h}`);
  await ctx.close();
}

await browser.close();
console.log(errors.length ? `Page errors:\n${[...new Set(errors)].join("\n")}` : "No page errors");
