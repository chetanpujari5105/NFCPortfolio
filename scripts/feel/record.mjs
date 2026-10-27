// Records the "feel" interactions as videos, for behaviour comparison only.
// Usage: node scripts/feel/record.mjs <ref|mine> [outDir] [baseUrl]
// Then:  node scripts/feel/analyze.mjs <outDir>   (motion segments from the videos)
import { chromium, devices } from "@playwright/test";
import { mkdirSync, renameSync, writeFileSync } from "node:fs";

const [target = "mine", outArg, baseArg] = process.argv.slice(2);
const out = outArg ?? `docs/feel/videos/${target}`;
const base = baseArg ?? (target === "ref" ? "https://www.prsd.dev" : "http://localhost:3100");
mkdirSync(out, { recursive: true });

const MINE = target !== "ref";
const sel = MINE
  ? { apps: ["Open Courses", "Open Settings", "Open Journey"], scrollApp: "Open Courses", detailApp: "Open Courses", search: "Search", swatches: ["Graphite", "Chai", "Electric"] }
  : { apps: ["Open Experience", "Open Settings", "Open Notes"], scrollApp: "Open Experience", detailApp: "Open Settings", search: "Search portfolio", swatches: ["Dark Cherry", "Cosmic Orange"] };

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const report = {};

/** Long tasks + a sampler for the 3D screen's transform (rotation), installed before load. */
const INIT = () => {
  window.__long = [];
  try {
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: true });
  } catch {}
  window.__sampleRot = (ms) =>
    new Promise((resolve) => {
      const out = [];
      const t0 = performance.now();
      const tick = () => {
        const el = [...document.querySelectorAll("div")].find((d) => {
          const r = d.getBoundingClientRect();
          return getComputedStyle(d).transform.startsWith("matrix3d") && r.height > 300 && r.height < 1000;
        });
        if (el) {
          const m = getComputedStyle(el).transform.match(/matrix3d\((.+)\)/)[1].split(",").map(Number);
          // Y rotation ≈ atan2(m[8], m[0]) for the CSS matrix
          out.push([Math.round(performance.now() - t0), Math.round((Math.atan2(-m[8], m[0]) * 180) / Math.PI)]);
        } else {
          const stage = document.querySelector("[data-stage]");
          if (stage?.dataset.roty) out.push([Math.round(performance.now() - t0), Math.round(Number(stage.dataset.roty))]);
        }
        if (performance.now() - t0 < ms) requestAnimationFrame(tick);
        else resolve(out);
      };
      tick();
    });
};

const ONLY = process.env.ONLY?.split(",");

async function scenario(name, run, { mobile = false } = {}) {
  if (ONLY && !ONLY.includes(name)) return;
  const ctx = await browser.newContext({
    ...(mobile ? { ...devices["iPhone 13"], defaultBrowserType: undefined } : { viewport: { width: 1440, height: 900 } }),
    recordVideo: { dir: out, size: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 } },
  });
  await ctx.addInitScript(INIT);
  if (MINE && name !== "arrival" && name !== "home") await ctx.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
  const page = await ctx.newPage();
  const t0 = Date.now();
  const marks = [];
  const mark = (label) => marks.push([label, (Date.now() - t0) / 1000]);
  const notes = {};
  try {
    await page.goto(base + "/", { waitUntil: "load" });
    mark("loaded");
    await run(page, mark, notes);
  } catch (e) {
    notes.error = String(e.message).split("\n")[0];
  }
  notes.longTasks = await page.evaluate(() => window.__long).catch(() => []);
  const video = page.video();
  await ctx.close();
  if (video) renameSync(await video.path(), `${out}/${name}.webm`);
  report[name] = { marks, ...notes };
  console.log(name, JSON.stringify(report[name]));
}

// force: the idle float keeps the 3D stage moving ±3px, which Playwright would wait out forever
const clickName = (page, name) => page.getByRole("button", { name, exact: true }).first().click({ timeout: 8000, force: true });
const settle = (page, ms = 1200) => page.waitForTimeout(ms);

await scenario("arrival", async (page) => settle(page, 3500));

await scenario("parallax", async (page, mark) => {
  await settle(page, 2500);
  mark("move");
  for (let i = 0; i <= 60; i++) {
    const a = (i / 60) * Math.PI * 2;
    await page.mouse.move(720 + Math.cos(a) * 520, 450 + Math.sin(a) * 300);
    await page.waitForTimeout(30);
  }
  await settle(page, 1200);
});

await scenario("rotate", async (page, mark, notes) => {
  await settle(page, 2500);
  if (MINE) await page.locator("[data-lock]").click({ timeout: 1500 }).catch(() => {});
  mark("drag");
  await page.mouse.move(250, 450);
  await page.mouse.down();
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(250 + i * 40, 450);
    await page.waitForTimeout(16);
  }
  const sampling = page.evaluate(() => window.__sampleRot(3500));
  await page.mouse.up();
  mark("release");
  const samples = await sampling;
  notes.rotation = samples.filter((_, i) => i % 6 === 0);
  await settle(page, 600);
});

await scenario("apps", async (page, mark) => {
  await settle(page, 2000);
  for (const app of sel.apps) {
    mark(`open ${app}`);
    await clickName(page, app);
    await settle(page, 1200);
    mark("close (Esc)");
    await page.keyboard.press("Escape");
    await settle(page, 1200);
  }
});

await scenario("scroll", async (page, mark) => {
  await settle(page, 2000);
  await clickName(page, sel.scrollApp);
  await settle(page, 1200);
  await page.mouse.move(720, 500);
  mark("scroll down");
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(40); }
  await settle(page, 800);
  mark("scroll up past top");
  for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(40); }
  await settle(page, 1500);
});

await scenario("detail", async (page, mark, notes) => {
  await settle(page, 2000);
  await clickName(page, sel.detailApp);
  await settle(page, 1200);
  const dialog = page.locator("[role=dialog]").last();
  const rows = dialog.locator("button");
  const n = await rows.count();
  const pick = rows.nth(Math.min(2, n - 1));
  notes.clicked = (await pick.getAttribute("aria-label")) ?? (await pick.innerText()).slice(0, 30);
  mark("open detail");
  await pick.click({ timeout: 4000, force: true });
  await settle(page, 1200);
  mark("back");
  await page.keyboard.press("Escape");
  await settle(page, 1200);
});

await scenario("finish", async (page, mark) => {
  await settle(page, 2000);
  for (const s of sel.swatches) {
    mark(`swatch ${s}`);
    await page.getByRole("radio", { name: s }).first().click({ timeout: 4000, force: true }).catch(() => clickName(page, s));
    await settle(page, 900);
  }
  const toggle = page.getByRole("button", { name: /theme|dark|light/i }).first();
  if (await toggle.count()) {
    mark("theme");
    await toggle.click({ force: true });
    await settle(page, 1200);
  }
});

// Step 5: lock screen swipe, home paging, pull-down Search and jiggle mode (mine only).
await scenario("home", async (page, mark) => {
  if (!MINE) return;
  await settle(page, 2600);
  const lock = await page.locator("[data-lock]").boundingBox();
  if (lock) {
    mark("unlock");
    const x = lock.x + lock.width / 2;
    await page.mouse.move(x, lock.y + lock.height * 0.85);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(x, lock.y + lock.height * (0.85 - i * 0.04));
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
    await settle(page, 1200);
  }
  const layer = await page.locator("[data-home-layer]").boundingBox();
  const swipe = async (fx, fy, tx, ty) => {
    await page.mouse.move(fx, fy);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(fx + ((tx - fx) * i) / 12, fy + ((ty - fy) * i) / 12);
      await page.waitForTimeout(16);
    }
    await page.mouse.up();
  };
  const y = layer.y + layer.height * 0.45;
  mark("page");
  await swipe(layer.x + layer.width * 0.85, y, layer.x + layer.width * 0.2, y);
  await settle(page, 1200);
  await swipe(layer.x + layer.width * 0.2, y, layer.x + layer.width * 0.85, y);
  await settle(page, 1000);
  mark("search");
  const cx = layer.x + layer.width / 2;
  await swipe(cx, layer.y + layer.height * 0.6, cx, layer.y + layer.height * 0.6 + 170);
  await settle(page, 1000);
  await page.keyboard.press("Escape");
  await settle(page, 800);
  mark("jiggle");
  const icon = await page.locator("[data-reorder]").first().boundingBox();
  await page.mouse.move(icon.x + icon.width / 2, icon.y + icon.height / 3);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await settle(page, 600);
  const target = await page.locator("[data-reorder]").nth(3).boundingBox();
  await swipe(icon.x + icon.width / 2, icon.y + icon.height / 3, target.x + target.width / 2, target.y + target.height / 3);
  await settle(page, 1500);
});

await scenario("search", async (page, mark) => {
  await settle(page, 2000);
  mark("open search");
  await clickName(page, sel.search);
  await settle(page, 800);
  await page.keyboard.type("set", { delay: 90 });
  await settle(page, 1000);
  mark("close");
  await page.keyboard.press("Escape");
  await settle(page, 900);
});

await scenario(
  "mobile",
  async (page, mark) => {
    await settle(page, 2000);
    mark("open app");
    await page.getByRole("button", { name: sel.apps[0], exact: true }).first().tap();
    await settle(page, 1200);
    mark("close");
    await page.keyboard.press("Escape");
    await settle(page, 1200);
  },
  { mobile: true },
);

writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
await browser.close();
