// Usage: node scripts/check-os.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";
const [out = "screens", base = "http://localhost:3100"] = process.argv.slice(2);
const b = await chromium.launch();
const log = (...a) => console.log(...a);
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light" });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(base + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(1000);
const state = async () => ({ hash: await p.evaluate(() => location.hash), title: await p.title(), dialog: await p.locator('[role=dialog][aria-modal=true]').count() });

await p.getByRole("button", { name: "Open Courses" }).click();
await p.waitForTimeout(90); await p.screenshot({ path: `${out}/open-90ms.png` });
await p.waitForTimeout(160); await p.screenshot({ path: `${out}/open-250ms.png` });
await p.waitForTimeout(600); await p.screenshot({ path: `${out}/open-done.png` });
log("after open:", await state(), "focused:", await p.evaluate(() => document.activeElement?.getAttribute("aria-label")));
await p.keyboard.press("Escape"); await p.waitForTimeout(120); await p.screenshot({ path: `${out}/close-120ms.png` });
await p.waitForTimeout(700);
log("after esc:", await state(), "focused:", await p.evaluate(() => document.activeElement?.getAttribute("aria-label")));

await p.getByRole("button", { name: "Open Journey" }).first().click(); await p.waitForTimeout(700);
await p.goBack(); await p.waitForTimeout(700);
log("after browser back:", await state());

await p.getByRole("button", { name: "Open Settings" }).click(); await p.waitForTimeout(700);
await p.getByRole("button", { name: "Back to Home" }).click(); await p.waitForTimeout(700);
log("after chevron:", await state());

// swipe up on the home indicator
await p.getByRole("button", { name: "Open Contact" }).click(); await p.waitForTimeout(800);
const box = await p.locator('[role=dialog] .cursor-grab').boundingBox();
await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down();
for (let i = 1; i <= 8; i++) { await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - i * 25); await p.waitForTimeout(16); }
await p.screenshot({ path: `${out}/swipe-mid.png` });
await p.mouse.up(); await p.waitForTimeout(800);
log("after swipe:", await state());

await p.getByRole("button", { name: "Open Socials" }).click(); await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/folder.png` });
log("folder:", await state());
await p.keyboard.press("Escape"); await p.waitForTimeout(400);

await p.keyboard.press("Meta+k"); await p.waitForTimeout(100);
await p.keyboard.type("veo"); await p.waitForTimeout(100);
await p.screenshot({ path: `${out}/spotlight.png` });
await p.keyboard.press("Enter"); await p.waitForTimeout(900);
log("spotlight enter:", await state());
await p.screenshot({ path: `${out}/course-detail.png` });
await p.keyboard.press("Escape"); await p.waitForTimeout(500);
log("esc from detail:", await state());
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
log("esc again:", await state());

// deep link
const p2 = await ctx.newPage();
await p2.goto(base + "/#platforms", { waitUntil: "networkidle" }); await p2.waitForTimeout(600);
await p2.screenshot({ path: `${out}/deeplink.png` });
log("deep link:", await p2.evaluate(() => location.hash), await p2.title());
await p2.keyboard.press("Escape"); await p2.waitForTimeout(700);
log("deep link esc:", await p2.evaluate(() => location.hash));

log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console errors");
await b.close();
