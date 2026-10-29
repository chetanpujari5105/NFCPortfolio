import { projects } from "../content/projects";
import { EMOJI, app, fitSuite, open, squash, swipeBack, textOf, unlocked, view } from "./apple";
import { expect, test, type Page } from "./fixtures";

/* Projects, laid out like Settings (v12): a segmented filter, every project with its facts and
 * link, details that push and swipe back, no emoji; plus the Android apps (v8) and the private
 * Anti-Doom repo that must never be linked. */

unlocked();

const ANDROID = ["Anti-Doom", "StackUp"];
/** Any GitHub URL for Anti-Doom: its repo is private. */
const PRIVATE_REPO = /github\.com\/[^"'\s<]*anti-doom/i;
const filter = (page: Page) => page.getByRole("radiogroup", { name: "Filter projects" });
const row = (page: Page, id: string) => app(page, "Projects").locator(`[data-project-row="${id}"]`);

test("every project, the Android apps included, filters with the segmented control", async ({ page }) => {
  await open(page, "projects");
  const text = await textOf(page, "app");
  for (const p of projects) {
    expect(text).toContain(squash(p.name));
    expect(text).toContain(squash(p.tagline));
  }
  expect(text).not.toMatch(EMOJI);
  await expect(app(page, "Projects").locator("[data-project-row]")).toHaveCount(projects.length);
  for (const name of ANDROID) await expect(app(page, "Projects").getByRole("button", { name: new RegExp(`^${name}`) })).toBeVisible();

  await filter(page).getByRole("radio", { name: "Games" }).click();
  await expect(filter(page).getByRole("radio", { name: "Games" })).toHaveAttribute("aria-checked", "true");
  await expect(row(page, "anti-doom")).toHaveCount(0);
  await expect(app(page, "Projects").locator("[data-project-row]")).toHaveCount(projects.filter((p) => p.category === "Games").length);
  await filter(page).getByRole("radio", { name: "Apps" }).click();
  await expect(row(page, "anti-doom")).toBeVisible();
  await expect(row(page, "strikepoint")).toHaveCount(0);
  await filter(page).getByRole("radio", { name: "All" }).click();
  await expect(row(page, "strikepoint")).toBeVisible();
});

test("each detail has the project's facts and its own link (or none)", async ({ page }) => {
  for (const p of projects) {
    await open(page, `projects/${p.id}`);
    await expect(view(page)).toBeVisible();
    const told = await textOf(page, "view");
    for (const fact of [p.name, p.tagline, p.description, ...p.stack, ...(p.status ? [p.status] : [])]) expect(told, p.id).toContain(squash(fact));
    expect(told).not.toMatch(EMOJI);
    const link = view(page).locator("[data-project-link]");
    if (!p.url) {
      await expect(link).toHaveCount(0);
      await expect(view(page).getByRole("link")).toHaveCount(0);
      continue;
    }
    await expect(link).toHaveAttribute("href", p.url);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);
    await expect(link).toHaveAccessibleName(`Open ${p.name} (opens in a new tab)`);
    await expect(link).toContainText(new URL(p.url).host);
  }
});

test("Anti-Doom shows its status and links nowhere (the repo is private)", async ({ page }) => {
  await open(page, "projects/anti-doom");
  await expect(view(page).locator("[data-project-status]")).toContainText("Android · source is private");
  await expect(view(page).getByRole("link")).toHaveCount(0);
  expect(await page.content()).not.toMatch(PRIVATE_REPO);
});

test("a project pushes its detail and swipes back from the left edge", async ({ page }) => {
  await open(page, "projects");
  await row(page, "stackup").click();
  await expect(view(page)).toBeVisible();
  await expect(page).toHaveURL(/#projects\/stackup$/);
  await expect(view(page)).toContainText("Closed alpha on Google Play");
  await swipeBack(page);
  await expect(view(page)).toHaveCount(0);
  await expect(page).toHaveURL(/#projects$/);
  await app(page, "Projects").locator("[data-project-featured]").click();
  await page.getByRole("button", { name: "Back to Projects" }).click();
  await expect(view(page)).toHaveCount(0);
});

test("the private repo is never linked from any page source", async ({ request }) => {
  for (const path of ["/", "/llms.txt"]) {
    const res = await request.get(path);
    if (res.ok()) expect(await res.text(), path).not.toMatch(PRIVATE_REPO);
  }
});

fitSuite(["projects", "projects/sidekick", "projects/anti-doom", "projects/stackup"]);
