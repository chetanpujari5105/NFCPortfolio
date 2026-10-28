// Screenshots of our own site for the guide (never of any other site).
// Usage: node guide/capture.mjs <outDir> [baseUrl=http://localhost:3100]
import { chromium, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const [outDir = "guide/shots", base = "http://localhost:3100"] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];

async function open(ctxOptions, { theme = "dark", finish = "electric", unlocked = true, hash = "" } = {}) {
  const ctx = await browser.newContext(ctxOptions);
  await ctx.addInitScript(
    ([t, f, u]) => {
      if (u) sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.setItem("pp-finish", f);
    },
    [theme, finish, unlocked],
  );
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/" + hash, { waitUntil: "networkidle" });
  return { ctx, page };
}

async function ready3D(page) {
  await page.mouse.move(40, 40);
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake"), null, { timeout: 10_000 });
  await page.waitForTimeout(1800);
}

async function overScreen(page) {
  const s = (await page.locator("[data-screen]").boundingBox()) ?? { x: 700, y: 400, width: 10, height: 10 };
  await page.mouse.move(s.x + s.width / 2, s.y + s.height * 0.9);
  await page.waitForTimeout(500);
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };
const phone = { ...devices["iPhone 13"], viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 };

// Desktop: front (both themes), back, page 2, an open app, Control Center
for (const theme of ["dark", "light"]) {
  const { ctx, page } = await open(desktop, { theme });
  await ready3D(page);
  await page.screenshot({ path: join(outDir, `front-${theme}.png`) });
  if (theme === "dark") {
    await page.getByRole("button", { name: "Page 2 of 2" }).click();
    await overScreen(page);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, `page2-${theme}.png`) });
    await page.getByRole("button", { name: "Page 1 of 2" }).click();
    await page.waitForTimeout(800);
    await page.locator('[data-app-icon="courses"]').first().click();
    await overScreen(page);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: join(outDir, `app-courses-${theme}.png`) });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(900);
    await page.locator("[data-panel-handle]").click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(outDir, `control-${theme}.png`) });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: "Flip the phone" }).click();
    await page.mouse.move(40, 40);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: join(outDir, `back-${theme}.png`) });
  }
  await ctx.close();
}

// Phone: lock screen, home, page 2, an open app
for (const theme of ["dark", "light"]) {
  const lock = await open(phone, { theme, unlocked: false });
  await lock.page.waitForTimeout(1500);
  await lock.page.screenshot({ path: join(outDir, `mobile-lock-${theme}.png`) });
  await lock.ctx.close();
  const { ctx, page } = await open(phone, { theme });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outDir, `mobile-home-${theme}.png`) });
  await page.locator('[data-app-icon="journey"]').first().click();
  await page.waitForTimeout(1300);
  await page.screenshot({ path: join(outDir, `mobile-journey-${theme}.png`) });
  await ctx.close();
}

await browser.close();
console.log(errors.length ? `Page errors:\n${[...new Set(errors)].join("\n")}` : "No page errors");
