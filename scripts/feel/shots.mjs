// Quick visual check of the 3D stage. Usage: node scripts/feel/shots.mjs <outDir> [baseUrl] [scheme]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [out = "docs/feel/frames/shots", base = "http://localhost:3100", scheme = "dark"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: scheme });
await ctx.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(base + "/", { waitUntil: "load" });
for (const t of [300, 700, 1200, 2500]) {
  await p.waitForTimeout(t - (t > 300 ? [300, 700, 1200, 2500][[300, 700, 1200, 2500].indexOf(t) - 1] : 0));
  await p.screenshot({ path: `${out}/load-${t}.png` });
}
const stage = await p.evaluate(() => {
  const s = document.querySelector("[data-stage]");
  return s ? { roty: s.dataset.roty, face: s.dataset.face, opacity: s.style.opacity, html3d: document.documentElement.hasAttribute("data-3d") } : null;
});
console.log("stage", JSON.stringify(stage));
// Drag to show the back
await p.mouse.move(300, 450);
await p.mouse.down();
for (let i = 1; i <= 18; i++) await p.mouse.move(300 + i * 20, 450, { steps: 2 });
await p.mouse.up();
await p.waitForTimeout(150);
await p.screenshot({ path: `${out}/spin-150.png` });
await p.waitForTimeout(1600);
await p.screenshot({ path: `${out}/spin-settled.png` });
console.log("after spin", await p.evaluate(() => JSON.stringify({ ...document.querySelector("[data-stage]")?.dataset })));
// Click on an app icon (proves the screen is clickable)
await p.keyboard.press("r");
await p.waitForTimeout(1500);
await p.getByRole("button", { name: "Open Courses", exact: true }).click();
await p.waitForTimeout(900);
await p.screenshot({ path: `${out}/app.png` });
console.log("hash", await p.evaluate(() => location.hash));
console.log("errors", JSON.stringify(errors));
await b.close();
