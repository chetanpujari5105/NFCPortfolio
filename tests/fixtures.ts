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
    // The 3D stage loads on the first sign of a visitor. Tests stand in for one with a no-op wheel
    // on the window (nothing else listens there), repeated until the stage is live.
    await page.addInitScript(() => {
      const id = window.setInterval(() => {
        if (innerWidth < 900 || document.documentElement.hasAttribute("data-3d")) return window.clearInterval(id);
        window.dispatchEvent(new WheelEvent("wheel"));
      }, 50);
      window.setTimeout(() => window.clearInterval(id), 20_000);
    });
    await provide(page);
  },
});
