import { test as base } from "@playwright/test";

export { expect, type Page } from "@playwright/test";

/**
 * The 3D phone floats ±3px while idle. People never notice (it pauses under the pointer), but
 * Playwright waits for an element to stop moving before it clicks, so tests hold the stage still
 * unless they opt in with `test.use({ float: true })`.
 */
export const test = base.extend<{ float: boolean; banner: boolean }>({
  float: [false, { option: true }],
  // The once-per-session notification banner drops over the top of the screen 8 s in; tests that
  // aren't about it start with it already "shown".
  banner: [false, { option: true }],
  page: async ({ page, float, banner }, provide) => {
    if (!banner) await page.addInitScript(() => sessionStorage.setItem("pp-banner", "1"));
    if (!float) {
      await page.addInitScript(() => {
        document.addEventListener("DOMContentLoaded", () => {
          const style = document.createElement("style");
          style.textContent = ".stage { animation: none !important; }";
          document.head.append(style);
        });
      });
    }
    await provide(page);
  },
});
