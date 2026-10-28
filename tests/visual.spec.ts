import { expect, test } from "./fixtures";

// The lock screen shows once per session; these tests start on the home screen.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
});

// Stable frames: reduced motion draws a still wallpaper; the clock is masked.
for (const scheme of ["light", "dark"] as const) {
  for (const path of ["/", "/#courses", "/#settings", "/#projects", "/#projects/anti-doom", "/#projects/stackup"]) {
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

// Home page 2: the widgets, with the Expertise stack resting on card 1 (no autoplay under reduced motion)
for (const scheme of ["light", "dark"] as const) {
  test(`home page 2 looks right in ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "Page 2 of 2" }).click();
    await expect(page.locator("[data-expertise-stack]")).toBeVisible();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot(`home2-${scheme}.png`, {
      // The clock, the heatmap, the latest video and the latest post change on their own
      mask: [page.locator("time"), page.locator("[data-github-widget]"), page.getByRole("link", { name: /^(YouTube @|Latest video)/ }), page.getByRole("button", { name: /^Latest post:/ })],
    });
  });
}
