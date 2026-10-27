import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ args: ["--use-angle=metal", "--ignore-gpu-blocklist"] });
const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
await page.goto("http://localhost:3100/#blog");
await page.mouse.move(40, 40);
await page.waitForSelector("html[data-3d]", { timeout: 20000 });
await page.waitForTimeout(1500);
const scr = await page.locator("[data-screen]").boundingBox();
const clip = { x: scr.x - 10, y: scr.y - 10, width: scr.width + 20, height: scr.height + 20 };
const cx = scr.x + scr.width / 2, cy = scr.y + scr.height / 2;
await page.mouse.move(cx, cy);
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/1-blog.png`, clip });
// pull down at top with the wheel
for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, -40); await page.waitForTimeout(16); }
await page.waitForTimeout(30);
await page.screenshot({ path: `${out}/2-pull.png`, clip });
await page.waitForTimeout(1500);
// scroll to collapse
await page.mouse.wheel(0, 260);
await page.waitForTimeout(600);
await page.screenshot({ path: `${out}/3-collapsed.png`, clip });
// swipe a row left
const row = page.locator("[data-swipe-row]").first();
await row.scrollIntoViewIfNeeded();
const r = await row.boundingBox();
await page.mouse.move(r.x + r.width * 0.8, r.y + r.height / 2);
await page.mouse.down();
for (let i = 1; i <= 10; i++) { await page.mouse.move(r.x + r.width * 0.8 - i * 12, r.y + r.height / 2); await page.waitForTimeout(16); }
await page.waitForTimeout(100);
await page.mouse.up();
await page.waitForTimeout(500);
await page.screenshot({ path: `${out}/4-swipe.png`, clip });
await page.keyboard.press("Escape");
await page.keyboard.press("Escape");
await page.waitForTimeout(1200);
// courses detail + edge swipe halfway
await page.goto("http://localhost:3100/#courses");
await page.mouse.move(40, 40);
await page.waitForSelector("html[data-3d]", { timeout: 20000 });
await page.waitForTimeout(1500);
await page.mouse.move(cx, cy);
await page.waitForSelector("[data-swipe-row]", { timeout: 8000 }).catch(async () => console.log("no rows", await page.evaluate(() => location.hash), await page.locator("[role=dialog]").getAttribute("aria-label").catch(() => "none")));
await page.locator("[data-swipe-row] button").first().click();
await page.waitForTimeout(800);
const pv = await page.locator("[data-push-view]").boundingBox();
await page.mouse.move(pv.x + 8, pv.y + pv.height / 2);
await page.mouse.down();
for (let i = 1; i <= 10; i++) { await page.mouse.move(pv.x + 8 + i * 14, pv.y + pv.height / 2); await page.waitForTimeout(16); }
await page.screenshot({ path: `${out}/5-edge.png`, clip });
await page.mouse.up();
await page.waitForTimeout(800);
// expertise sheet
await page.goto("http://localhost:3100/#expertise");
await page.mouse.move(40, 40);
await page.waitForSelector("html[data-3d]", { timeout: 20000 });
await page.waitForTimeout(1500);
await page.mouse.move(cx, cy);
await page.locator("[data-screen] ul button").first().click();
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/6-sheet.png`, clip });
await b.close();
