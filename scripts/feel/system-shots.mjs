// Stills of the system UI (status pill, Control Center, notification banner) for a visual check.
import { chromium } from "playwright";
const out = process.argv[2] ?? "docs/feel/frames/s7";
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
await page.goto("http://localhost:3100/");
await page.waitForSelector("html[data-3d]", { timeout: 20000 });
const scr = await page.locator("[data-screen]").boundingBox();
const clip = { x: scr.x - 10, y: scr.y - 10, width: scr.width + 20, height: scr.height + 20 };
await page.mouse.move(scr.x + scr.width / 2, scr.y + scr.height / 2);
await page.waitForTimeout(1500);
// Status pill: switch theme from the studio toggle
await page.getByRole("button", { name: "Dark mode" }).first().click({ force: true });
await page.waitForTimeout(450);
await page.screenshot({ path: `${out}/1-pill.png`, clip });
await page.waitForTimeout(2600);
// Control Center: pull down from the top-right corner, hold mid-way, then let go
const h = await page.locator("[data-panel-handle]").boundingBox();
await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
await page.mouse.down();
for (let i = 1; i <= 8; i++) { await page.mouse.move(h.x + h.width / 2, h.y + i * 20); await page.waitForTimeout(16); }
await page.screenshot({ path: `${out}/2-panel-mid.png`, clip });
for (let i = 9; i <= 16; i++) { await page.mouse.move(h.x + h.width / 2, h.y + i * 20); await page.waitForTimeout(16); }
await page.mouse.up();
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/3-panel.png`, clip });
await page.keyboard.press("Escape");
await page.waitForTimeout(800);
// Banner: 8 s after unlock
await page.waitForSelector("[data-banner]", { timeout: 15000 });
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/4-banner.png`, clip });
await b.close();
