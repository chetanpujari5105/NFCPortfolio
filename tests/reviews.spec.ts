import { reviews, udemyProfileStats } from "../content/reviews";
import { expect, test, type Page } from "./fixtures";

/* Reviews: real Udemy reviews, word for word; a summary computed from them; a paged carousel that
 * follows the finger; "See All Reviews" with course filters and rows that open the course. */

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
});

const app = (page: Page) => page.getByRole("dialog", { name: "Reviews" });
const squash = (s: string) => s.replace(/\s+/g, " ").trim();

async function open(page: Page, hash = "reviews") {
  await page.goto(`/#${hash}`);
  await expect(app(page)).toBeVisible();
  await page.waitForFunction(() => innerWidth < 900 || document.documentElement.hasAttribute("data-3d"), null, { timeout: 25_000 });
  await page.waitForTimeout(600);
}

test("content: every review is a verified 5-star Udemy quote, one per person, 20–60 words", () => {
  expect(reviews.length).toBeGreaterThanOrEqual(12);
  expect(reviews.length).toBeLessThanOrEqual(24);
  expect(new Set(reviews.map((r) => r.author)).size).toBe(reviews.length);
  for (const r of reviews) {
    expect(r).toMatchObject({ source: "Udemy", verified: true, rating: 5 });
    expect(r.courseUrl).toMatch(/^https:\/\/www\.udemy\.com\/course\//);
    const words = r.text.split(/\s+/).length;
    expect(words, r.id).toBeGreaterThanOrEqual(20);
    expect(words, r.id).toBeLessThanOrEqual(60);
  }
  expect(new Set(reviews.map((r) => r.course)).size).toBeGreaterThanOrEqual(5);
});

test("summary, carousel and the full list show the reviews word for word", async ({ page }) => {
  await open(page);
  const summary = app(page).getByRole("region", { name: "Ratings summary" });
  await expect(summary).toContainText("5.0");
  await expect(summary).toContainText(`${reviews.length} reviews shown here`);
  await expect(summary).toContainText(udemyProfileStats.reviews.toLocaleString("en-US"));
  await expect(app(page)).not.toContainText("coming soon");

  await app(page).getByRole("button", { name: "See All Reviews" }).click();
  const view = page.locator("[data-push-view]");
  await expect(view).toBeVisible();
  const rows = view.locator("[data-review-row]");
  await expect(rows).toHaveCount(reviews.length);
  const text = squash(await view.innerText());
  for (const r of reviews) {
    expect(text).toContain(squash(r.text));
    expect(text).toContain(r.author);
  }
  // Each row opens its course on Udemy in a new tab
  const first = rows.first();
  await expect(first).toHaveAttribute("href", reviews[0].courseUrl);
  await expect(first).toHaveAttribute("target", "_blank");

  // A course chip narrows the list
  await view.getByRole("button", { name: "Notion", exact: true }).click();
  await expect(rows).toHaveCount(reviews.filter((r) => r.courseShort === "Notion").length);
  await view.getByRole("button", { name: "All", exact: true }).click();
  await expect(rows).toHaveCount(reviews.length);
});

test("the carousel pages with a drag, the arrow keys and the dots", async ({ page }) => {
  await open(page);
  const carousel = app(page).locator("[data-review-carousel]");
  const dots = app(page).getByRole("tablist", { name: "Pages" }).getByRole("tab");
  await expect(dots.first()).toHaveAttribute("aria-selected", "true");

  const box = (await carousel.boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width * 0.8, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(box.x + box.width * (0.8 - 0.06 * i), y);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await expect(dots.nth(1)).toHaveAttribute("aria-selected", "true");

  await carousel.focus();
  await page.keyboard.press("ArrowRight");
  await expect(dots.nth(2)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(dots.nth(1)).toHaveAttribute("aria-selected", "true");

  await dots.nth(3).click();
  await expect(dots.nth(3)).toHaveAttribute("aria-selected", "true");
  // The selected slide is in view, inside the carousel
  await page.waitForTimeout(500);
  const slide = (await app(page).locator('[data-review-slide="3"]').boundingBox())!;
  const frame = (await carousel.boundingBox())!;
  expect(slide.x).toBeGreaterThanOrEqual(frame.x - 1);
  expect(slide.x + slide.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
});

test("no emoji anywhere in the app", async ({ page }) => {
  await open(page, "reviews/all");
  const text = (await page.locator("[data-app-window]").textContent()) ?? "";
  expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
});
