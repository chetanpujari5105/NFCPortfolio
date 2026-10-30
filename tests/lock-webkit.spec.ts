import { expect, test } from "./fixtures";

/* Lock screen checks that only WebKit (iPhone Safari's engine) shows. Needs
 * `npx playwright install webkit`. Runs once, in the desktop project, at phone sizes. */

test.use({ browserName: "webkit" });

test("refitting the clock never trips a ResizeObserver loop", async ({ page }) => {
  // The live lock screen reported "ResizeObserver loop completed with undelivered notifications":
  // the fit resized the digits it was observing inside the same delivery.
  test.skip(test.info().project.name !== "desktop", "viewport set per case");
  await page.addInitScript(() => {
    localStorage.setItem("pp-text", "large");
    const w = window as unknown as { __errors: string[] };
    w.__errors = [];
    window.addEventListener("error", (e) => w.__errors.push(e.message));
  });
  for (const size of [{ width: 320, height: 568 }, { width: 430, height: 932 }]) {
    await page.setViewportSize(size);
    await page.clock.setFixedTime(new Date(2026, 9, 29, 1, 11, 5));
    await page.goto("/");
    await expect(page.locator("[data-lock]")).toBeVisible();
    await page.waitForTimeout(300);
    // The digits change width under the observer, as when the display font swaps in: much wider
    // (the fit shrinks them), then back (the fit grows them again); then the screen resizes
    for (const spacing of ["0.4em", "", "0.3em", ""]) {
      await page.locator("[data-lock] .lock-digits").evaluate((el: HTMLElement, s) => (el.style.letterSpacing = s), spacing);
      await page.waitForTimeout(200);
    }
    await page.setViewportSize({ width: size.width + 40, height: size.height });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as { __errors: string[] }).__errors), `${size.width}x${size.height}`).toEqual([]);
  }
});
