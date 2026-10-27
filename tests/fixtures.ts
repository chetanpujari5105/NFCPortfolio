import { test as base } from "@playwright/test";

export { expect, type Page } from "@playwright/test";

/**
 * The 3D phone floats ±3px while idle. People never notice (it pauses under the pointer), but
 * Playwright waits for an element to stop moving before it clicks, so tests hold the stage still
 * unless they opt in with `test.use({ float: true })`.
 */
export const test = base.extend<{ float: boolean }>({
  float: [false, { option: true }],
  page: async ({ page, float }, provide) => {
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
