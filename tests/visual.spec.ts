import { expect, test } from "@playwright/test";

// Stable frames: reduced motion draws a still wallpaper; the clock is masked.
for (const scheme of ["light", "dark"] as const) {
  for (const path of ["/", "/#courses", "/#settings"]) {
    test(`${path} looks right in ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(600);
      await expect(page).toHaveScreenshot(`${path.replace(/\W+/g, "") || "home"}-${scheme}.png`, {
        mask: [page.locator("time")],
      });
    });
  }
}
