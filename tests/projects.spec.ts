import { expect, test, type Page } from "./fixtures";

import { projects } from "../content/projects";

// The lock screen shows once per session; these tests start on the home screen.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("pp-unlocked", "1"));
});

const ANDROID = ["Anti-Doom", "StackUp"];
/** Any GitHub URL for Anti-Doom: its repo is private. */
const PRIVATE_REPO = /github\.com\/[^"'\s<]*anti-doom/i;

/** Deep-link into Projects and wait until the phone is still (3D swap done). */
async function open(page: Page, hash = "projects") {
  await page.goto(`/#${hash}`);
  await expect(page.locator("[data-app-window] > [role=dialog]")).toBeVisible();
  await page.waitForFunction(() => innerWidth < 900 || document.documentElement.hasAttribute("data-3d"), null, {
    timeout: 25_000,
  });
  await page.waitForTimeout(700);
}

/** Every text element inside `root` that is cut off (ellipsis or overflow). */
const clipped = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((roots) =>
    roots.flatMap((root) =>
      [root, ...root.querySelectorAll<HTMLElement>("*")]
        .filter((el) => el.childElementCount === 0 && el.textContent?.trim())
        .filter((el) => el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)
        .map((el) => el.textContent!.trim()),
    ),
  );

test("the Android apps are listed, filter with Apps and fit their rows", async ({ page }) => {
  await open(page);
  const group = page.getByRole("group", { name: "Filter projects" });
  const row = (name: string) => page.getByRole("button", { name: new RegExp(`^${name}`) });
  for (const name of ANDROID) await expect(row(name)).toBeVisible();
  for (const name of ANDROID) expect(await clipped(page, `button:has-text("${name}") .min-w-0`), name).toEqual([]);

  await group.getByRole("button", { name: "Games" }).click();
  for (const name of ANDROID) await expect(row(name)).toHaveCount(0);
  await group.getByRole("button", { name: "Apps" }).click();
  for (const name of ANDROID) await expect(row(name)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Strikepoint/ })).toHaveCount(0);
  await group.getByRole("button", { name: "All" }).click();
  await expect(page.getByRole("button", { name: /^Strikepoint/ })).toBeVisible();
});

test("Anti-Doom shows its status and links nowhere (the repo is private)", async ({ page }) => {
  await open(page, "projects/anti-doom");
  const detail = page.getByRole("heading", { name: "Anti-Doom", level: 2 }).locator("xpath=../..");
  await expect(detail).toContainText("Android · source is private");
  await expect(detail.getByRole("link")).toHaveCount(0);
  expect(await page.content()).not.toMatch(PRIVATE_REPO);
});

test("StackUp opens its public repo", async ({ page }) => {
  await open(page, "projects/stackup");
  const detail = page.getByRole("heading", { name: "StackUp", level: 2 }).locator("xpath=../..");
  await expect(detail).toContainText("Closed alpha on Google Play");
  const link = detail.getByRole("link", { name: "Open StackUp (new tab)" });
  await expect(link).toHaveAttribute("href", projects.find((p) => p.id === "stackup")!.url!);
});

test("the private repo is never linked from any page source", async ({ request }) => {
  for (const path of ["/", "/llms.txt"]) {
    const res = await request.get(path);
    if (res.ok()) expect(await res.text(), path).not.toMatch(PRIVATE_REPO);
  }
});
