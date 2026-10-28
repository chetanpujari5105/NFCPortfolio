// Covers for the two Android projects that have no website to screenshot: Anti-Doom (two real
// screenshots from the app, on its own espresso-and-amber theme) and StackUp (its own logo on its
// own palette; the app's screens sit behind Google sign-in). Rendered in Chromium at 2x and saved as
// 960 × 600 WebP, the size of every other project card.
// Run: node scripts/project-covers.mjs <anti-doom dashboard.png> <anti-doom vision.png> <stackup logo.png>
import { readFile, stat, writeFile } from "node:fs/promises";

import { chromium } from "playwright";
import sharp from "sharp";

const [dashboard, vision, logo] = process.argv.slice(2);
if (!logo) throw new Error("usage: node scripts/project-covers.mjs <dashboard.png> <vision.png> <logo.png>");
const W = 960;
const H = 600;
const out = "public/content/projects";

/** A phone screenshot, trimmed of its status bar and tab bar, as a data URL. */
const screen = async (file) => {
  const png = await sharp(file).extract({ left: 0, top: 150, width: 1080, height: 1900 }).resize(540).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
};
const dataUrl = async (file) => `data:image/png;base64,${(await readFile(file)).toString("base64")}`;

const base = `
  * { box-sizing: border-box; margin: 0; }
  body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: -apple-system, "SF Pro Display", "Helvetica Neue", sans-serif; }
  .card { position: relative; width: 100%; height: 100%; padding: 44px 0 0 52px; overflow: hidden; }
  .brand { display: flex; align-items: center; gap: 12px; font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }
  h1 { margin-top: 34px; font-size: 62px; line-height: 0.98; font-weight: 800; letter-spacing: -0.035em; }
  p { margin-top: 20px; width: 400px; font-size: 18px; line-height: 1.42; }
  .chips { position: absolute; left: 52px; bottom: 40px; display: flex; gap: 8px; }
  .chip { padding: 7px 13px; border-radius: 99px; font-size: 13px; font-weight: 600; }
  .phone { position: absolute; width: 236px; height: 415px; border-radius: 34px; overflow: hidden; background-size: cover; background-position: top; }
`;

const antiDoom = `
  <style>${base}
    .card { background: radial-gradient(120% 110% at 78% 40%, #4a2e16 0%, #2c1a0c 42%, #190f07 72%, #110a05 100%); color: #fbefd9; }
    .dot { width: 30px; height: 30px; border-radius: 9px; background: radial-gradient(circle at 40% 35%, #ff7bd5, #e2259f 70%); box-shadow: 0 0 18px #ff4fbf88; }
    .kicker { color: #f5a83a; }
    h1 { font-size: 56px; }
    h1 span { color: #f5a83a; }
    p { color: #fbefd9a3; }
    .chip { background: #ffedd216; border: 1px solid #ffedc829; color: #fbefd9; }
    .phone { box-shadow: 0 30px 60px -20px #000c, 0 0 0 1px #ffedc829; }
  </style>
  <div class="card">
    <div class="brand"><span class="dot"></span>Anti-Doom</div>
    <h1>Stop the<br>scroll. <span>Breathe.</span></h1>
    <p style="width: 380px">Counts your Reels and Shorts, then pauses you for a breath and your own goals. Free and offline.</p>
    <div class="chips"><span class="chip">Android</span><span class="chip">Kotlin</span><span class="chip">Jetpack Compose</span></div>
    <div class="phone" style="left: 498px; top: 118px; background-image: url(${await screen(vision)})"></div>
    <div class="phone" style="left: 706px; top: 70px; background-image: url(${await screen(dashboard)})"></div>
  </div>`;

const stackUp = `
  <style>${base}
    .card { background: radial-gradient(90% 100% at 80% 50%, #13261f 0%, #0f1117 62%); color: #e2e2eb; }
    .mark { width: 34px; height: 34px; border-radius: 9px; }
    h1 span { color: #00c97f; }
    p { color: #8a8fa3; }
    .chip { background: #1a1d27; border: 1px solid #2a2d3a; color: #e2e2eb; }
    .logo { position: absolute; left: 560px; top: 110px; width: 360px; height: 360px; border-radius: 80px; box-shadow: 0 40px 90px -30px #00c97f55, 0 0 0 1px #2a2d3a; }
  </style>
  <div class="card">
    <div class="brand"><img class="mark" src="${await dataUrl(logo)}" alt="">StackUp</div>
    <h1>Track it.<br>Stack it.<br><span>Crush it.</span></h1>
    <p>Your daily supplement stack: scan a bottle, get reminded on time, keep the streak.</p>
    <div class="chips"><span class="chip">Flutter</span><span class="chip">Dart</span><span class="chip">Firebase</span></div>
    <img class="logo" src="${await dataUrl(logo)}" alt="">
  </div>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
for (const [name, html] of [["anti-doom", antiDoom], ["stackup", stackUp]]) {
  await page.setContent(`<html><body>${html}</body></html>`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  const png = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
  const file = `${out}/${name}.webp`;
  await writeFile(file, await sharp(png).resize(W, H, { kernel: "lanczos3" }).webp({ quality: 82, effort: 6 }).toBuffer());
  console.log(file, `${((await stat(file)).size / 1024).toFixed(1)} KB`);
}
await browser.close();
