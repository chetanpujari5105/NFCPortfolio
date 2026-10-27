import { expect, test, type Page } from "@playwright/test";

/*
 * Gesture end-states, driven with the real mouse / touchscreen. These run on every viewport;
 * on desktop the screen sits inside the 3D phone, which is facing the camera at rest.
 */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
});

const dialog = (page: Page) => page.locator("[role=dialog][aria-modal=true][aria-label]:not([aria-label='App switcher'])");

async function home(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-app-icon]").first()).toBeVisible();
}

async function openApp(page: Page, label: string) {
  await page.getByRole("button", { name: `Open ${label}`, exact: true }).first().click();
  await expect(dialog(page)).toBeVisible();
  await page.waitForTimeout(700); // launch spring settles
}

/** Drag with the mouse in small steps; `hold` pauses before releasing. */
async function drag(page: Page, from: { x: number; y: number }, to: { x: number; y: number }, opts: { steps?: number; hold?: number; delay?: number } = {}) {
  const { steps = 12, hold = 0, delay = 0 } = opts;
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    if (delay) await page.waitForTimeout(delay);
  }
  if (hold) await page.waitForTimeout(hold);
  await page.mouse.up();
}

async function indicator(page: Page) {
  const box = (await page.locator("[data-home-indicator]").boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test("a short swipe on the home indicator springs the app back open", async ({ page }) => {
  await home(page);
  await openApp(page, "Journey");
  const start = await indicator(page);
  await drag(page, start, { x: start.x, y: start.y - 40 }, { steps: 8, delay: 30 });
  await page.waitForTimeout(800);
  await expect(dialog(page)).toBeVisible();
  await expect(page).toHaveURL(/#journey$/);
});

test("a long swipe flies the app back into its icon", async ({ page }) => {
  await home(page);
  await openApp(page, "Journey");
  const start = await indicator(page);
  const screen = (await page.locator("[data-screen]").boundingBox())!;
  await drag(page, start, { x: start.x + 20, y: start.y - screen.height * 0.45 }, { steps: 10 });
  await expect(dialog(page)).toHaveCount(0);
  await expect(page).not.toHaveURL(/#journey$/);
});

test("swipe up and hold opens the app switcher; a card reopens its app", async ({ page }) => {
  await home(page);
  await openApp(page, "Courses");
  const start = await indicator(page);
  await drag(page, start, { x: start.x, y: start.y - 160 }, { steps: 10, delay: 20, hold: 650 });
  const switcher = page.getByRole("dialog", { name: "App switcher" });
  await expect(switcher).toBeVisible();
  await expect(switcher.getByRole("button", { name: "Open Courses" })).toBeVisible();
  await switcher.getByRole("button", { name: "Open Courses" }).click();
  await expect(switcher).toHaveCount(0);
  await expect(page).toHaveURL(/#courses$/);
});

test("Ctrl+↑ toggles the switcher; Esc closes it; a card can be closed", async ({ page }) => {
  await home(page);
  await openApp(page, "Journey");
  await page.keyboard.press("Escape");
  await openApp(page, "Settings");
  await page.keyboard.press("Control+ArrowUp");
  const switcher = page.getByRole("dialog", { name: "App switcher" });
  await expect(switcher).toBeVisible();
  await expect(switcher.locator("[data-card]")).toHaveCount(2);
  await switcher.getByRole("button", { name: "Close Journey" }).click();
  await expect(switcher.locator("[data-card]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(switcher).toHaveCount(0);
});

test("switching apps from Search goes out to home, then into the new app", async ({ page }) => {
  await home(page);
  await openApp(page, "Journey");
  await page.keyboard.press("ControlOrMeta+k");
  await page.keyboard.type("settings");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#settings$/);
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Journey" })).toHaveCount(0);
});
