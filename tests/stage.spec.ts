import { expect, test, type Page } from "@playwright/test";

/* The 3D phone is the desktop default (≥ 900px, WebGL, motion allowed). */

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== "desktop", "3D stage is desktop-only");
  test.setTimeout(60_000);
  await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
});

const stage = (page: Page) => page.locator("[data-stage]");
const rotY = async (page: Page) => Number(await stage(page).getAttribute("data-roty"));

async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-3d", { timeout: 25_000 });
  await expect(stage(page).locator(".stage-canvas canvas")).toBeVisible();
  await expect(stage(page)).toHaveAttribute("data-face", "front");
}

/** A slow drag that comes to rest before release, so there is no flick inertia. */
async function drag(page: Page, from: [number, number], dx: number, steps = 16) {
  await page.mouse.move(...from);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from[0] + (dx * i) / steps, from[1]);
    await page.waitForTimeout(16);
  }
  await page.waitForTimeout(150);
  await page.mouse.up();
}

test("a flick keeps spinning with its velocity before it settles", async ({ page }) => {
  await ready(page);
  await page.mouse.move(300, 450);
  await page.mouse.down();
  await page.mouse.move(500, 450, { steps: 4 });
  await page.mouse.up();
  // 200 px of drag is 100°; the release velocity carries it well past that
  await expect.poll(() => rotY(page)).toBeGreaterThan(140);
});

test("the screen lives in the 3D phone and stays clickable", async ({ page }) => {
  await ready(page);
  await expect(page.locator(".stage-screen [data-screen]")).toHaveCount(1);
  await page.getByRole("button", { name: "Open Courses", exact: true }).click();
  await expect(page).toHaveURL(/#courses$/);
});

test("dragging the stage spins the phone, then it springs back to the front", async ({ page }) => {
  await ready(page);
  await drag(page, [260, 450], 120);
  await expect.poll(() => rotY(page)).not.toBe(0);
  // Settles on a front face (a multiple of 360°) after the idle pause
  await expect.poll(async () => (await rotY(page)) % 360, { timeout: 6000 }).toBe(0);
  await expect(stage(page)).toHaveAttribute("data-face", "front");
});

test("a half turn settles on the back; a tap brings the front back", async ({ page }) => {
  await ready(page);
  // 360 px ≈ half a turn; slow, so there is little inertia
  await drag(page, [200, 450], 360, 40);
  await expect(stage(page)).toHaveAttribute("data-face", "back", { timeout: 6000 });
  await page.waitForTimeout(1800);
  await expect(stage(page)).toHaveAttribute("data-face", "back");
  await page.mouse.click(200, 450);
  await expect(stage(page)).toHaveAttribute("data-face", "front", { timeout: 6000 });
});

test("drags that start on the screen never rotate the phone", async ({ page }) => {
  await ready(page);
  const screen = (await page.locator("[data-screen]").boundingBox())!;
  await drag(page, [screen.x + screen.width / 2, screen.y + screen.height * 0.75], 200);
  await page.waitForTimeout(300);
  expect(await rotY(page)).toBe(0);
});

test("R resets the phone to the front", async ({ page }) => {
  await ready(page);
  await drag(page, [200, 450], 360, 40);
  await expect(stage(page)).toHaveAttribute("data-face", "back", { timeout: 6000 });
  await page.keyboard.press("r");
  await expect(stage(page)).toHaveAttribute("data-face", "front", { timeout: 6000 });
});

test("reduced motion keeps the flat CSS phone", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-app-icon]").first()).toBeVisible();
  await expect(page.locator("[data-stage]")).toHaveCount(0);
  await expect(page.locator(".phone-bezel [data-screen]")).toHaveCount(1);
});
