// Usage: node scripts/feel/probe.mjs <url> <outDir>
// Dumps the interactive structure of a page (for behaviour notes only) plus a screenshot.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const [url = "https://www.prsd.dev/", out = "docs/feel/probe"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/desktop.png` });
const info = await p.evaluate(() => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
  };
  return {
    canvases: [...document.querySelectorAll("canvas")].map((c) => ({ box: box(c), cursor: getComputedStyle(c).cursor, parentCursor: getComputedStyle(c.parentElement).cursor })),
    transforms: [...document.querySelectorAll("div")]
      .filter((d) => getComputedStyle(d).transform.startsWith("matrix3d"))
      .slice(0, 5)
      .map((d) => ({ box: box(d), t: getComputedStyle(d).transform.slice(0, 80) })),
    buttons: [...document.querySelectorAll("button, a, [role=button]")]
      .filter(vis)
      .slice(0, 60)
      .map((el) => `${el.tagName} ${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40)} @${box(el)}`),
  };
});
console.log(JSON.stringify(info, null, 1));
await b.close();
