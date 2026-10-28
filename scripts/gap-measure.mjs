// Measures the home screen of this site and of the quality reference with the same probes:
// geometry (getBoundingClientRect), computed styles, and pixel analysis of icon tiles (glyph size
// as a share of the tile, top/bottom face colour). Writes the numbers as JSON and side-by-side
// crops of the same element (reference left, ours right, both at the reference's phone scale).
// Measurements only: nothing from the reference is reused.
// Usage: node scripts/gap-measure.mjs [outDir=docs/v6] [ours=http://localhost:3100] [--theme=light]
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const theme = process.argv.find((a) => a.startsWith("--theme="))?.slice(8) ?? "light";
const [outDir = "docs/v6", ours = "http://localhost:3100"] = args;
const REF = "https://www.prsd.dev/#home";
const DPR = 2;

// Same element on both sites: [reference selector, our selector]
const PROBES = {
  screen: [".iphone-screen", "[data-screen]"],
  tile: [".home-widgets ~ * .ios-icon, .iphone-screen .ios-icon", "[data-home-page='0'] [data-app-icon] .icon-tile"],
  label: [".iphone-screen button:has(.ios-icon) > span:not(.ios-icon)", "[data-home-page='0'] [data-app-icon] .icon-label"],
  widgetWide: [".github-widget", "[data-app-icon='journey-widget'] [data-widget-tile]"],
  widgetSmall: [".call-widget", "[data-app-icon='services-widget'] [data-widget-tile]"],
  widgetKicker: [".call-head small", "[data-app-icon='services-widget'] [data-widget-tile] > span:first-child"],
  widgetTitle: [".call-event strong", "[data-app-icon='services-widget'] [data-widget-tile] > span:nth-child(2)"],
  widgetLabel: [".github-widget + span, .home-widgets span:not([class])", "[data-app-icon='journey-widget'] .icon-label"],
  dock: [".iphone-dock", "[data-dock]"],
  dockTile: [".iphone-dock .ios-icon", "[data-dock] .icon-tile"],
  search: [".spotlight-button", "[data-search-pill]"],
  status: [".iphone-status", "[data-screen] .tab\\:grid, [data-screen] > div:has(> span > time)"],
  statusTime: [".iphone-status > span:first-child", "[data-screen] time"],
  folder: [null, ".icon-folder .icon-tile"],
};

const STYLE_KEYS = [
  "borderRadius", "backgroundColor", "backgroundImage", "backdropFilter", "boxShadow", "borderTopWidth", "borderTopColor",
  "paddingTop", "paddingLeft", "fontFamily", "fontSize", "fontWeight", "color", "textShadow", "letterSpacing", "lineHeight", "filter",
];

async function probe(page, side) {
  return page.evaluate(
    ({ probes, side, keys }) => {
      const pick = (sel) => (sel ? document.querySelector(sel) : null);
      const out = {};
      for (const [name, sels] of Object.entries(probes)) {
        const el = pick(sels[side]);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const style = Object.fromEntries(keys.map((k) => [k, String(cs[k]).slice(0, 140)]));
        style.mask = cs.maskImage !== "none" || cs.webkitMaskImage !== "none" ? "image mask" : "none";
        out[name] = { x: r.x, y: r.y, w: r.width, h: r.height, style };
      }
      // Grid rhythm: every home tile outside the dock, sorted into rows and columns
      const tiles = [...document.querySelectorAll(probes.tile[side].split(",").pop().trim())]
        .filter((t) => !t.closest(side === 0 ? ".iphone-dock" : "[data-dock]"))
        .map((t) => t.getBoundingClientRect());
      const uniq = (a) => [...new Set(a.map((v) => Math.round(v)))].sort((p, q) => p - q);
      const xs = uniq(tiles.map((t) => t.x));
      const ys = uniq(tiles.map((t) => t.y));
      out.rhythm = { cols: xs.slice(1).map((x, i) => x - xs[i]), rows: ys.slice(1).map((y, i) => y - ys[i]) };
      const dt = [...document.querySelectorAll(probes.dockTile[side])].map((t) => t.getBoundingClientRect());
      out.dockRhythm = dt.slice(1).map((t, i) => Math.round(t.x - dt[i].x));
      out.tileRects = tiles.slice(0, 12).map((t) => [t.x, t.y, t.width, t.height]);
      return out;
    },
    { probes: PROBES, side, keys: STYLE_KEYS },
  );
}

/** Glyph box and face colours of one tile, from a screenshot buffer (DPR px). */
async function tilePixels(png, [x, y, w, h]) {
  const left = Math.round(x * DPR), top = Math.round(y * DPR), size = Math.round(Math.min(w, h) * DPR);
  const { data, info } = await sharp(png).extract({ left, top, width: size, height: size }).raw().toBuffer({ resolveWithObject: true });
  const at = (px, py) => {
    const i = (py * info.width + px) * info.channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  // The face colour: sampled down the left edge strip (inside the corner curve)
  const edge = (fy) => at(Math.round(size * 0.1), Math.round(size * fy));
  const top_ = edge(0.3), bottom = edge(0.82);
  // Glyph: pixels far from the face colour of their own row (handles a gradient face)
  let minX = size, minY = size, maxX = 0, maxY = 0;
  const m = Math.round(size * 0.12);
  for (let py = m; py < size - m; py++) {
    const face = at(Math.round(size * 0.1), py);
    for (let px = m; px < size - m; px++) {
      const c = at(px, py);
      if (Math.abs(c[0] - face[0]) + Math.abs(c[1] - face[1]) + Math.abs(c[2] - face[2]) > 90) {
        minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      }
    }
  }
  const hex = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
  return {
    glyphW: +(((maxX - minX) / size) * 100).toFixed(0),
    glyphH: +(((maxY - minY) / size) * 100).toFixed(0),
    faceTop: hex(top_),
    faceBottom: hex(bottom),
  };
}

async function crop(png, box, scale, pad = 8) {
  const { width: W, height: H } = await sharp(png).metadata();
  const left = Math.max(0, Math.round((box.x - pad) * DPR)), top = Math.max(0, Math.round((box.y - pad) * DPR));
  const width = Math.min(W - left, Math.round((box.w + pad * 2) * DPR)), height = Math.min(H - top, Math.round((box.h + pad * 2) * DPR));
  return sharp(png).extract({ left, top, width, height }).resize({ width: Math.round(width * scale) }).png().toBuffer();
}

async function sideBySide(a, b, file) {
  const [ma, mb] = await Promise.all([sharp(a).metadata(), sharp(b).metadata()]);
  const gap = 24;
  const W = ma.width + mb.width + gap, H = Math.max(ma.height, mb.height);
  await sharp({ create: { width: W, height: H, channels: 4, background: "#808080" } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: ma.width + gap, top: 0 }])
    .png()
    .toFile(file);
}

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const result = {};
await mkdir(join(outDir, "compare"), { recursive: true });

for (const [w, h] of [[1440, 900], [390, 844]]) {
  const vp = `${w}x${h}`;
  const shots = [];
  for (const [side, url] of [[0, REF], [1, ours + "/"]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: DPR, colorScheme: theme, hasTouch: w < 600, isMobile: w < 600 });
    await ctx.addInitScript((t) => {
      sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      localStorage.setItem("pp-theme", t);
      localStorage.setItem("pp-finish", "burgundy");
    }, theme);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    if (side === 1 && w >= 900) {
      await page.mouse.move(40, 40);
      await page.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 }).catch(() => {});
    }
    await page.waitForTimeout(3500);
    const m = await probe(page, side);
    const png = await page.screenshot();
    m.tilePixels = [];
    for (const rect of m.tileRects) m.tilePixels.push(await tilePixels(png, rect));
    shots.push({ m, png });
    await ctx.close();
  }
  const [ref, mine] = shots;
  result[vp] = { reference: ref.m, ours: mine.m };
  await writeFile(join(outDir, `gap-measurements-${theme}.json`), JSON.stringify(result, null, 1));
  // Crops at the reference's phone scale
  const scale = ref.m.screen.w / mine.m.screen.w;
  const pairs = {
    "icon-row": (m) => {
      const r = m.tileRects.slice(0, 4);
      const x = Math.min(...r.map((t) => t[0])), y = Math.min(...r.map((t) => t[1]));
      // The row's tiles and their labels below
      return { x, y, w: Math.max(...r.map((t) => t[0] + t[2])) - x, h: r[0][3] * 1.42 };
    },
    "widget-small": (m) => m.widgetSmall,
    "widget-wide": (m) => m.widgetWide,
    dock: (m) => m.dock,
    search: (m) => m.search,
    status: (m) => m.status,
    "home-screen": (m) => m.screen,
  };
  for (const [name, box] of Object.entries(pairs)) {
    const a = box(ref.m), b = box(mine.m);
    if (!a || !b || a.w < 2 || a.h < 2 || b.w < 2 || b.h < 2) continue;
    await sideBySide(await crop(ref.png, a, 1), await crop(mine.png, b, scale), join(outDir, "compare", `${name}-${vp}-${theme}.png`));
  }
}

await browser.close();
await writeFile(join(outDir, `gap-measurements-${theme}.json`), JSON.stringify(result, null, 1));
console.log(`wrote ${join(outDir, `gap-measurements-${theme}.json`)} and ${join(outDir, "compare")}`);
