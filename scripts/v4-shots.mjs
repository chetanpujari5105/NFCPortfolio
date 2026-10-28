// v4 review captures: the 3D phone front + back in every finish and theme (1440×900), the phone
// layout (390×844), home page 2, and a video of clicks/drags on the stage with a contact sheet.
// Usage: node scripts/v4-shots.mjs <outDir> [baseUrl=http://localhost:3100] [--no-video]
import { chromium, devices } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [outDir = "docs/v4/shots", base = "http://localhost:3100"] = args;
const video = !process.argv.includes("--no-video");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const errors = [];

async function open(ctxOptions, { theme = "light", finish = "burgundy" } = {}) {
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

async function ready3D(page) {
  await page.mouse.move(40, 40);
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-awake"), null, { timeout: 10_000 });
  await page.waitForTimeout(1800);
}

const desktop = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 };

for (const theme of ["light", "dark"]) {
  for (const finish of ["burgundy", "electric", "graphite", "chai"]) {
    const { ctx, page } = await open(desktop, { theme, finish });
    await ready3D(page);
    await page.screenshot({ path: join(outDir, `front-${finish}-${theme}.png`) });
    await page.getByRole("button", { name: "Flip the phone" }).click();
    await page.mouse.move(40, 40);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: join(outDir, `back-${finish}-${theme}.png`) });
    await ctx.close();
  }
}

// Home page 2 + phone layout
for (const theme of ["light", "dark"]) {
  const { ctx, page } = await open(desktop, { theme });
  await ready3D(page);
  await page.getByRole("button", { name: "Page 2 of 2" }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: join(outDir, `page2-desktop-${theme}.png`) });
  await ctx.close();
  const phone = await open({ ...devices["iPhone 13"], viewport: { width: 390, height: 844 } }, { theme });
  await phone.page.waitForTimeout(1500);
  await phone.page.screenshot({ path: join(outDir, `home-phone-${theme}.png`) });
  await phone.page.getByRole("button", { name: "Page 2 of 2" }).click();
  await phone.page.waitForTimeout(1500);
  await phone.page.screenshot({ path: join(outDir, `page2-phone-${theme}.png`) });
  await phone.ctx.close();
}

if (video) {
  const vdir = join(outDir, "video-tmp");
  const { ctx, page } = await open({ ...desktop, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: 1440, height: 900 } } });
  await ready3D(page);
  const s = await page.locator("[data-screen]").evaluate((el) => el.getBoundingClientRect().toJSON());
  const frame = [s.x - 5, s.y + s.height / 2];
  const beside = [s.x - 160, s.y + s.height / 2];
  const screen = [s.x + s.width / 2, s.y + s.height * 0.62];
  for (const at of [screen, frame, beside]) {
    await page.mouse.move(...at, { steps: 8 });
    await page.waitForTimeout(400);
    await page.mouse.click(...at);
    await page.mouse.dblclick(...at);
    await page.mouse.down();
    await page.mouse.move(at[0] + 10, at[1] + 3, { steps: 2 });
    await page.mouse.up();
    await page.waitForTimeout(600);
  }
  // A deliberate drag to the back, a pause, then back to the front
  for (let k = 0; k < 2; k++) {
    await page.mouse.move(...beside);
    await page.mouse.down();
    for (let i = 1; i <= 20; i++) {
      await page.mouse.move(beside[0] + i * 10, beside[1]);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await page.waitForTimeout(1500);
  }
  await page.locator('[data-app-icon="courses"]').first().click();
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(800);
  await ctx.close();
  const [file] = await readdir(vdir);
  await rename(join(vdir, file), join(outDir, "stage.webm"));
  await rm(vdir, { recursive: true });
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(outDir, "stage.webm"), "-vf", "fps=3,scale=360:-1,tile=6x6", "-frames:v", "1", join(outDir, "stage-frames.png")]);
}

await browser.close();
console.log(errors.length ? `Console errors:\n${[...new Set(errors)].join("\n")}` : "No console errors");
