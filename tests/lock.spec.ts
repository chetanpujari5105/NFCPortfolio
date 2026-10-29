import { expect, settled, test, type Page } from "./fixtures";

/* The lock screen: a fresh context starts a new session, so it shows; a reload keeps the session. */

const dialog = (page: Page) => page.locator("[data-app-window] > [role=dialog]");

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

test.describe("lock screen", () => {
  test("a short drag springs back; swiping up past 30% unlocks, once per session", async ({ page }) => {
    await page.goto("/");
    const lock = page.locator("[data-lock]");
    await expect(lock).toBeVisible();
    const box = (await lock.boundingBox())!;
    const x = box.x + box.width / 2;
    await drag(page, { x, y: box.y + box.height * 0.8 }, { x, y: box.y + box.height * 0.7 }, { steps: 6, delay: 20, hold: 150 });
    await page.waitForTimeout(600);
    await expect(lock).toBeVisible();
    await drag(page, { x, y: box.y + box.height * 0.85 }, { x, y: box.y + box.height * 0.3 }, { steps: 10 });
    await expect(lock).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open Courses", exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator("[data-app-icon]").first()).toBeVisible();
    await expect(page.locator("[data-lock]")).toBeHidden();
  });

  test("a tap wakes it, a second tap or Enter opens; deep links skip the lock screen", async ({ page }) => {
    await page.goto("/#courses");
    await expect(page.locator("[data-lock]")).toBeHidden();
    await expect(dialog(page)).toBeVisible();
    await page.evaluate(() => sessionStorage.removeItem("pp-unlocked"));
    await page.goto("/");
    const lock = page.locator("[data-lock]");
    await expect(lock).toBeVisible();
    await settled(page);
    const box = (await lock.boundingBox())!;
    const empty = { x: box.x + box.width / 2, y: box.y + box.height * 0.08 };
    await page.mouse.click(empty.x, empty.y);
    await page.waitForTimeout(700);
    await expect(lock).toBeVisible();
    await page.mouse.click(empty.x, empty.y);
    await expect(lock).toHaveCount(0);

    await page.evaluate(() => sessionStorage.removeItem("pp-unlocked"));
    await page.reload();
    await page.waitForTimeout(300);
    await page.getByRole("button", { name: "Swipe up to open" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("[data-lock]")).toHaveCount(0);
  });

  test("the flashlight boosts the screen; the camera opens Contact", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const torch = page.getByRole("button", { name: "Flashlight" });
    await torch.click();
    await expect(torch).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("[data-torch]")).toHaveCount(1);
    await torch.click();
    await expect(torch).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-torch]")).toHaveCount(0);
    await torch.click();
    await page.getByRole("button", { name: /^Camera/ }).click();
    await expect(page.locator("[data-lock]")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Contact" })).toBeVisible();
    // Unlocking switches the flashlight off
    await expect(page.locator("[data-torch]")).toHaveCount(0);
  });

  test("Substack notifications: the brand mark, a stack that spreads, a card that opens the post", async ({ page }) => {
    await page.goto("/");
    await settled(page);
    const cards = page.locator("[data-lock-stack] button");
    const n = await cards.count();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(3);
    // The Substack mark (simple-icons), on its orange squircle
    const tile = cards.first().locator("span.squircle").first();
    await expect(tile).toHaveCSS("background-color", "rgb(255, 103, 25)");
    if (n > 1) {
      // Stacked: the cards behind sit under the front one, only their edges showing
      const [a, b] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
      expect(b!.y + b!.height - (a!.y + a!.height)).toBeLessThan(12);
      await cards.first().click();
      await expect(cards.first()).toHaveAttribute("aria-label", /Open in Blog$/);
      await page.waitForTimeout(600);
      const [c, d] = [await cards.nth(0).boundingBox(), await cards.nth(1).boundingBox()];
      expect(d!.y).toBeGreaterThan(c!.y + c!.height - 1);
    }
    await cards.first().click();
    await expect(page.locator("[data-lock]")).toHaveCount(0);
    await expect(page.getByRole("dialog", { name: "Blog" })).toBeVisible();
    await expect(page).toHaveURL(/#blog\/.+/);
  });

  test("the clock is tall and fits at its widest", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-10-29T10:08:00"));
    await page.goto("/");
    await settled(page);
    const clock = page.locator(".lock-digits");
    await expect(clock).toHaveText("10:08");
    await expect(page.locator(".lock-date")).toHaveText("Thu, Oct 29");
    const [screen, digits] = [await page.locator("[data-screen]").boundingBox(), await clock.boundingBox()];
    // About 28–34% of the screen's height, and inside it side to side
    const share = digits!.height / screen!.height;
    expect(share).toBeGreaterThan(0.27);
    expect(share).toBeLessThan(0.35);
    const ink = await clock.evaluate((el) => {
      const r = document.createRange();
      r.selectNodeContents(el);
      const b = r.getBoundingClientRect();
      return { left: b.left, right: b.right };
    });
    expect(ink.left).toBeGreaterThan(screen!.x);
    expect(ink.right).toBeLessThan(screen!.x + screen!.width);
  });

  test("a scroll on the desktop opens it too", async ({ page }, info) => {
    test.skip(info.project.name === "phone", "wheel is the desktop's swipe");
    await page.goto("/");
    await settled(page);
    const box = (await page.locator("[data-lock]").boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let i = 0; i < 8; i++) await page.mouse.wheel(0, 60);
    await expect(page.locator("[data-lock]")).toHaveCount(0);
  });
});
