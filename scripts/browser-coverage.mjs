// Key flows in real engines at phone sizes, read-only (never sends the contact form):
// WebKit at iPhone sizes (390×844, 430×932, 320×568) and Chromium with Android emulation (360×800),
// each light and dark, default and Larger Text. Lock screen (clock fit, the notifications' targets,
// swipe up), Control Center (pull down, swipe up), the dock, and every app: opens from its icon,
// pushes a detail, swipes back from the edge, closes from the home indicator. No page errors and no
// sideways overflow anywhere. Screenshots of failures go to <outDir>.
// Usage: node scripts/browser-coverage.mjs <base> <outDir> [--engines=webkit,chromium,firefox] [--quick]
import { chromium, firefox, webkit } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1] ?? d;
const [base = "https://nfcportfolio-two.vercel.app", outDir = "docs/morning/browser-coverage"] = args.filter((a) => !a.startsWith("--"));
const engines = opt("engines", "webkit,chromium").split(",");
const quick = args.includes("--quick");
const only = opt("flows", "lock,home").split(",");
await mkdir(outDir, { recursive: true });

const SIZES = {
  webkit: [[390, 844], [430, 932], [320, 568]],
  chromium: [[360, 800]],
  firefox: [[390, 844]],
};
const LAUNCH = { webkit, chromium, firefox };
// Apps and the row that pushes their detail (Contact has none)
const APPS = [
  ["journey", "Journey", "[data-journey-row]"],
  ["expertise", "Expertise", "[data-area-row]"],
  ["platforms", "Platforms", "[data-partners-row]"],
  ["reviews", "Reviews", "role=button[name='See All Reviews']"],
  ["projects", "Projects", "[data-project-row]"],
  ["services", "Services", "[data-service-row]"],
  ["courses", "Courses", "[data-course-row]"],
  ["blog", "Blog", "[data-post-row]"],
  ["settings", "Settings", "[data-profile-row]"],
  ["contact", "Contact", null],
];

const rows = [];
const check = (run, name, ok, detail = "") => {
  rows.push({ run, name, ok, detail });
  if (!ok || process.env.VERBOSE) console.log(`${ok ? "PASS" : "FAIL"}  ${run}  ${name}${detail ? `  (${detail})` : ""}`);
};

async function drag(p, from, to, steps = 12, hold = 0) {
  await p.mouse.move(from.x, from.y);
  await p.mouse.down();
  for (let i = 1; i <= steps; i++) {
    await p.mouse.move(from.x + ((to.x - from.x) * i) / steps, from.y + ((to.y - from.y) * i) / steps);
    await p.waitForTimeout(16);
  }
  if (hold) await p.waitForTimeout(hold);
  await p.mouse.up();
}

const awake = (p) => p.waitForFunction(() => document.documentElement.hasAttribute("data-awake"), null, { timeout: 120_000 });

/** Sideways overflow: the page, or visible text outside the screen that isn't inside a scroller.
 *  With a detail pushed, only the detail counts (the list behind it slides away on purpose). */
const overflow = (p) =>
  p.evaluate(() => {
    const pushed = document.querySelector("[data-push-view]");
    const W = innerWidth;
    const page = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - W;
    const screen = document.querySelector("[data-screen]")?.getBoundingClientRect();
    const right = screen ? screen.right : W;
    const left = screen ? screen.left : 0;
    // Leaf text that sticks out of the screen and is visible (not inside a horizontal scroller)
    const out = [...(pushed ? pushed.querySelectorAll("*") : document.querySelectorAll("[data-app-window] [role=dialog] *"))]
      .filter((n) => n.childElementCount === 0 && n.textContent?.trim() && n.offsetParent)
      // Reviews' carousel cards clamp on purpose (as the App Store does); See All shows every word,
      // and the "reviews detail" check covers that list
      .filter((n) => !n.closest(".review-card"))
      .filter((n) => {
        const b = n.getBoundingClientRect();
        if (b.width < 2 || (b.right <= right + 1 && b.left >= left - 1)) return false;
        for (let a = n.parentElement; a; a = a.parentElement) {
          const s = getComputedStyle(a);
          if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && a.scrollWidth > a.clientWidth + 1) return false;
        }
        return true;
      })
      .map((n) => n.textContent.trim().slice(0, 30));
    return { page, out: out.slice(0, 4) };
  });

/** Text cut off (ellipsis, clamp, hidden overflow) inside root. */
const clipped = (p, root) =>
  p.locator(root).first().evaluate((el) =>
    [...el.querySelectorAll("h1, h2, li span, li a, li button, dd, dt, p, label, a, button")]
      .filter((n) => n.childElementCount === 0 && n.textContent?.trim() && n.offsetParent)
      // Reviews' carousel cards clamp on purpose (as the App Store does); See All shows every word,
      // and the "reviews detail" check covers that list
      .filter((n) => !n.closest(".review-card"))
      .filter((n) => n.getBoundingClientRect().width > 1)
      .filter((n) => n.scrollWidth > n.clientWidth + 1 || n.scrollHeight > n.clientHeight + 1)
      // Only text that is actually hidden: glyphs taller than a tight line box still paint when overflow is visible
      .filter((n) => {
        const c = getComputedStyle(n);
        return c.overflowX !== "visible" || c.overflowY !== "visible" || c.webkitLineClamp !== "none" || c.textOverflow === "ellipsis";
      })
      .map((n) => n.textContent.trim().slice(0, 30))
      .slice(0, 4),
  ).catch(() => ["(root missing)"]);

async function newPage(browser, engine, [w, h], theme, text, { locked }) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    deviceScaleFactor: 2,
    colorScheme: theme,
    ...(engine !== "firefox" && { isMobile: true }),
    hasTouch: true,
    userAgent:
      engine === "webkit"
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
        : engine === "chromium"
          ? "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36"
          : undefined,
  });
  // Outside links open in a new tab; don't load them
  await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1|nfcportfolio)/, (r) =>
    r.request().resourceType() === "document" ? r.abort() : r.continue(),
  );
  await ctx.addInitScript(
    ({ locked, text }) => {
      if (!locked) sessionStorage.setItem("pp-unlocked", "1");
      sessionStorage.setItem("pp-banner", "1");
      if (text === "large") localStorage.setItem("pp-text", "large");
    },
    { locked, text },
  );
  // Pages the site sends visitors to (new tabs), recorded before they're stopped
  const outside = [];
  ctx.on("request", (r) => r.isNavigationRequest() && !r.url().startsWith(base) && outside.push(r.url()));
  const p = await ctx.newPage();
  p.setDefaultNavigationTimeout(180_000);
  p.setDefaultTimeout(30_000);
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  return { ctx, p, errors, outside };
}

async function lockFlows(browser, engine, size, theme, text, run, shot) {
  const { ctx, p, errors, outside } = await newPage(browser, engine, size, theme, text, { locked: true });
  await p.goto(base + "/", { waitUntil: "load" });
  await awake(p);
  await p.waitForTimeout(800);
  const lock = p.locator("[data-lock]");
  const m = await p.evaluate(() => {
    const s = document.querySelector("[data-screen]").getBoundingClientRect();
    const d = document.querySelector(".lock-digits");
    const r = document.createRange();
    r.selectNodeContents(d);
    const ink = r.getBoundingClientRect();
    const date = document.querySelector("[data-lock] .lock-date")?.getBoundingClientRect();
    const clipped = [...document.querySelectorAll("[data-lock] time, [data-lock] button, [data-lock-item]")]
      .filter((n) => n.offsetParent && n.getAttribute("aria-hidden") !== "true")
      .filter((n) => {
        const b = n.getBoundingClientRect();
        return b.bottom > s.bottom + 0.5 || b.top < s.top - 0.5 || b.left < s.left - 0.5 || b.right > s.right + 0.5;
      }).length;
    return {
      left: (ink.left - s.left) / s.width,
      right: (s.right - ink.right) / s.width,
      underDate: !date || d.getBoundingClientRect().top + 1 >= date.bottom,
      clipped,
      notes: [...document.querySelectorAll("[data-lock-stack] [data-note]")].map((n) => n.getAttribute("data-note")),
    };
  });
  check(run, "Lock clock fits (4%+ each side, under the date)", m.left >= 0.04 && m.right >= 0.04 && m.underDate, `${(m.left * 100).toFixed(1)}% / ${(m.right * 100).toFixed(1)}%`);
  check(run, "Lock screen: nothing off screen", m.clipped === 0, `${m.clipped} off screen`);
  check(run, "Lock notifications", m.notes.length >= 2 && m.notes.includes("project"), m.notes.join(", "));
  const ov = await overflow(p);
  check(run, "Lock: no sideways overflow", ov.page <= 1, `${ov.page}px`);
  await p.screenshot({ path: shot("lock") });

  // Expand the stack, then each card opens its own place
  const cards = p.locator("[data-lock-stack] [data-note]");
  await cards.first().click();
  await p.waitForTimeout(700);
  if (m.notes.includes("instagram")) {
    // The new tab's page load is stubbed, so check where it asked to go
    const popup = ctx.waitForEvent("page", { timeout: 10_000 }).catch(() => null);
    await p.locator('[data-note="instagram"]').click();
    const tab = await popup;
    await p.waitForTimeout(1000);
    check(run, "Notification: reel opens its link in a new tab", !!tab && outside.length > 0, outside[0]?.slice(0, 50) ?? (tab ? "tab, no outside request" : "no tab"));
    await tab?.close();
    check(run, "Notification: the lock screen stays after the reel", await lock.isVisible());
  }
  if (m.notes.includes("substack")) {
    await p.locator('[data-note="substack"]').click();
    await lock.waitFor({ state: "detached", timeout: 8000 }).catch(() => {});
    check(run, "Notification: post opens Blog", /#blog\/.+/.test(p.url()) && (await p.getByRole("dialog", { name: "Blog" }).isVisible()), p.url().split("#")[1] ?? "");
    await p.evaluate(() => sessionStorage.removeItem("pp-unlocked"));
    await p.goto(base + "/", { waitUntil: "load" });
    await awake(p);
    await p.waitForTimeout(800);
    await cards.first().click();
    await p.waitForTimeout(700);
  }
  await p.locator('[data-note="project"]').click();
  await lock.waitFor({ state: "detached", timeout: 8000 }).catch(() => {});
  check(run, "Notification: project opens its detail", /#projects\/.+/.test(p.url()) && (await p.locator("[data-push-view]").isVisible().catch(() => false)), p.url().split("#")[1] ?? "");

  // Swipe up to unlock (a short drag springs back first)
  await p.evaluate(() => sessionStorage.removeItem("pp-unlocked"));
  await p.goto(base + "/", { waitUntil: "load" });
  await awake(p);
  await p.waitForTimeout(800);
  const box = await lock.boundingBox();
  const x = box.x + box.width / 2;
  await drag(p, { x, y: box.y + box.height * 0.8 }, { x, y: box.y + box.height * 0.72 }, 6, 150);
  await p.waitForTimeout(700);
  check(run, "Lock: a short drag springs back", await lock.isVisible());
  await drag(p, { x, y: box.y + box.height * 0.88 }, { x, y: box.y + box.height * 0.3 }, 10);
  const gone = await lock.waitFor({ state: "detached", timeout: 6000 }).then(() => true, () => false);
  check(run, "Lock: swipe up unlocks", gone);
  if (!gone) await p.screenshot({ path: shot("FAIL-unlock") });
  check(run, "No page errors (lock)", !errors.length, errors.slice(0, 2).join(" | "));
  await ctx.close();
}

async function homeFlows(browser, engine, size, theme, text, run, shot) {
  const { ctx, p, errors } = await newPage(browser, engine, size, theme, text, { locked: false });
  await p.goto(base + "/", { waitUntil: "load" });
  await awake(p);
  await p.waitForTimeout(1000);
  let ov = await overflow(p);
  check(run, "Home: no sideways overflow", ov.page <= 1, `${ov.page}px`);
  const dock = await p.locator("[data-dock] [data-dock-key]").evaluateAll((els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return { key: e.getAttribute("data-dock-key"), painted: !!hit && e.contains(hit), inside: r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight };
    }),
  );
  check(run, "Dock: 4 icons, painted, on screen", dock.length === 4 && dock.every((d) => d.painted && d.inside), dock.map((d) => `${d.key}${d.painted && d.inside ? "" : "!"}`).join(", "));
  await p.screenshot({ path: shot("home") });

  // Control Center: pull down from the top-right corner, swipe up to close
  const handle = await p.locator("[data-panel-handle]").boundingBox();
  const sx = handle.x + handle.width * 0.6;
  await drag(p, { x: sx, y: handle.y + 2 }, { x: sx, y: handle.y + size[1] * 0.45 }, 10);
  await p.waitForTimeout(800);
  const expanded = (await p.locator("[data-panel-handle]").getAttribute("aria-expanded")) === "true";
  const controls = await p.getByRole("dialog", { name: "Control Center" }).locator("button, a, [role=slider]").count().catch(() => 0);
  check(run, "Control Center: pull down opens it", expanded && controls >= 10, `${controls} controls`);
  if (expanded) {
    ov = await overflow(p);
    check(run, "Control Center: no sideways overflow", ov.page <= 1, `${ov.page}px`);
    await p.screenshot({ path: shot("control-center") });
    const y0 = size[1] * 0.85;
    await drag(p, { x: size[0] / 2, y: y0 }, { x: size[0] / 2, y: size[1] * 0.2 }, 10);
    await p.waitForTimeout(800);
    let closed = (await p.locator("[data-panel-handle]").getAttribute("aria-expanded")) !== "true";
    check(run, "Control Center: swipe up closes it", closed);
    if (!closed) {
      await p.screenshot({ path: shot("FAIL-cc-close") });
      await p.keyboard.press("Escape");
      await p.waitForTimeout(600);
    }
  } else await p.screenshot({ path: shot("FAIL-cc-open") });

  for (const [key, name, row] of quick ? APPS.slice(0, 3) : APPS) {
    const where = `${key}`;
    // From its icon (dock or page 1); otherwise its link
    const icon = p.locator(`[data-dock] [data-dock-key="${key}"], [data-home-page='0'] [data-home-key="${key}"]`).first();
    let via = "icon";
    if (await icon.isVisible().catch(() => false)) await icon.click();
    else {
      via = "link";
      await p.evaluate((k) => (location.hash = k), key);
    }
    const dialog = p.getByRole("dialog", { name, exact: true });
    const opened = await dialog.waitFor({ state: "visible", timeout: 10_000 }).then(() => true, () => false);
    check(run, `${where}: opens (${via})`, opened);
    if (!opened) {
      await p.screenshot({ path: shot(`FAIL-${key}-open`) });
      await p.evaluate(() => (location.hash = "home"));
      await p.waitForTimeout(800);
      continue;
    }
    await p.waitForTimeout(900);
    ov = await overflow(p);
    const cut = await clipped(p, "[data-app-window] > [role=dialog]");
    check(run, `${where}: no sideways overflow`, ov.page <= 1 && !ov.out.length, `${ov.page}px ${ov.out.join(" | ")}`);
    check(run, `${where}: nothing cut off`, !cut.length, cut.join(" | "));
    if (row) {
      const target = row.startsWith("role=") ? dialog.getByRole("button", { name: "See All Reviews" }) : dialog.locator(row).first();
      await target.scrollIntoViewIfNeeded().catch(() => {});
      await target.click();
      const view = p.locator("[data-push-view]");
      const pushed = await view.waitFor({ state: "visible", timeout: 6000 }).then(() => true, () => false);
      check(run, `${where}: pushes a detail`, pushed);
      if (pushed) {
        await p.waitForTimeout(800);
        ov = await overflow(p);
        const cutV = await clipped(p, "[data-push-view]");
        check(run, `${where} detail: no sideways overflow`, ov.page <= 1 && !ov.out.length, `${ov.page}px ${ov.out.join(" | ")}`);
        check(run, `${where} detail: nothing cut off`, !cutV.length, cutV.join(" | "));
        const vb = await view.boundingBox();
        const y = vb.y + vb.height / 2;
        await drag(p, { x: vb.x + 14, y }, { x: vb.x + vb.width * 0.75, y });
        const back = await view.waitFor({ state: "detached", timeout: 4000 }).then(() => true, () => false);
        check(run, `${where}: edge swipe goes back`, back);
        if (!back) {
          await p.screenshot({ path: shot(`FAIL-${key}-back`) });
          await p.goBack();
          await p.waitForTimeout(800);
        }
      } else await p.screenshot({ path: shot(`FAIL-${key}-push`) });
    }
    // Close from the home indicator
    const bar = p.locator("[data-app-window] [data-home-indicator]").first();
    const bb = await bar.boundingBox().catch(() => null);
    if (bb) await drag(p, { x: bb.x + bb.width / 2, y: bb.y + bb.height - 6 }, { x: bb.x + bb.width / 2, y: bb.y - size[1] * 0.45 }, 10);
    const closed = await dialog.waitFor({ state: "detached", timeout: 5000 }).then(() => true, () => false);
    check(run, `${where}: home indicator closes it`, closed);
    if (!closed) {
      await p.screenshot({ path: shot(`FAIL-${key}-close`) });
      await p.evaluate(() => (location.hash = "home"));
      await p.waitForTimeout(800);
    }
    await p.waitForTimeout(400);
  }
  check(run, "No page errors (home/apps)", !errors.length, errors.slice(0, 2).join(" | "));
  await ctx.close();
}

for (const engine of engines) {
  const browser = await LAUNCH[engine].launch();
  for (const size of SIZES[engine])
    for (const theme of ["light", "dark"])
      for (const text of quick ? ["default"] : ["default", "large"]) {
        const run = `${engine.padEnd(8)} ${size.join("x").padEnd(7)} ${theme.padEnd(5)} ${text.padEnd(7)}`;
        const shot = (name) => join(outDir, `${engine}-${size.join("x")}-${theme}-${text}-${name}.png`);
        for (const flows of [lockFlows, homeFlows].filter((f) => only.some((o) => f.name.startsWith(o))))
          await flows(browser, engine, size, theme, text, run, shot).catch(async (e) => check(run, `${flows.name} crashed`, false, e.message.split("\n")[0]));
        const mine = rows.filter((r) => r.run === run);
        console.log(`${run}  ${mine.filter((r) => r.ok).length}/${mine.length}`);
      }
  await browser.close();
}
console.log(`${rows.filter((r) => r.ok).length}/${rows.length} passed`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
