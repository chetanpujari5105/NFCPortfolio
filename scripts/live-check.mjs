// Live checks against the deployed site (read-only unless --send): 390×844 and 1440×900, light and
// dark. Lock screen (clock size and fit, Substack notification, unlock), home pages painted, heatmap,
// YouTube widget, Journey, Projects, Contact. Screenshots to <outDir> (docs/morning is gitignored).
// --send: also sends ONE real message from the Contact form at 390×844 (light), and reports the API answer.
// Usage: node scripts/live-check.mjs [base=https://nfcportfolio-two.vercel.app] [outDir=docs/morning] [--send]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const send = args.includes("--send");
const [base = "https://nfcportfolio-two.vercel.app", outDir = "docs/morning"] = args.filter((a) => !a.startsWith("--"));
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const rows = [];
const check = (run, name, ok, detail = "") => rows.push({ run, name, ok, detail });

async function page([w, h], theme, { locked = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: theme, isMobile: w < 600, hasTouch: w < 900 });
  await ctx.addInitScript((locked) => {
    if (!locked) sessionStorage.setItem("pp-unlocked", "1");
    sessionStorage.setItem("pp-banner", "1");
  }, locked);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return { ctx, p, errors };
}

async function arrive(p, w) {
  if (w >= 900) {
    await p.mouse.move(40, 40);
    await p.waitForFunction(() => document.documentElement.hasAttribute("data-3d"), null, { timeout: 30_000 });
  }
  await p.waitForFunction(() => document.documentElement.hasAttribute("data-awake"), null, { timeout: 30_000 });
  await p.waitForTimeout(w >= 900 ? 2000 : 1200);
}

for (const [w, h] of [[390, 844], [1440, 900]])
  for (const theme of ["light", "dark"]) {
    const run = `${w}x${h} ${theme}`;
    const shot = (name) => join(outDir, `${name}-${w}x${h}-${theme}.png`);

    // Lock screen
    {
      const { ctx, p, errors } = await page([w, h], theme, { locked: true });
      await p.goto(base + "/", { waitUntil: "networkidle" });
      await arrive(p, w);
      const lock = p.locator("[data-lock]");
      const m = await p.evaluate(() => {
        const s = document.querySelector("[data-screen]").getBoundingClientRect();
        const d = document.querySelector(".lock-digits");
        const r = document.createRange();
        r.selectNodeContents(d);
        const ink = r.getBoundingClientRect();
        const box = d.getBoundingClientRect();
        const clipped = [...document.querySelectorAll("[data-lock] time, [data-lock] button, [data-lock-item]")]
          .filter((n) => n.offsetParent && n.getAttribute("aria-hidden") !== "true")
          .filter((n) => {
            const b = n.getBoundingClientRect();
            return b.bottom > s.bottom + 0.5 || b.top < s.top - 0.5 || b.left < s.left - 0.5 || b.right > s.right + 0.5;
          }).length;
        const tile = document.querySelector("[data-lock-stack] .squircle");
        return {
          share: box.height / s.height,
          inside: ink.left >= s.left && ink.right <= s.right,
          clipped,
          time: d.textContent,
          cards: document.querySelectorAll("[data-lock-stack] button").length,
          substack: tile ? getComputedStyle(tile).backgroundColor : null,
        };
      });
      check(run, "Lock clock 28–34% of the screen, inside it", m.share > 0.27 && m.share < 0.35 && m.inside, `${(m.share * 100).toFixed(1)}%, "${m.time}"`);
      check(run, "Lock screen: nothing clipped", m.clipped === 0, `${m.clipped} clipped`);
      check(run, "Substack notification with its mark", m.cards > 0 && m.substack === "rgb(255, 103, 25)", `${m.cards} card(s)`);
      await p.screenshot({ path: shot("lock") });
      await p.getByRole("button", { name: "Swipe up to open" }).focus();
      await p.keyboard.press("Enter");
      await lock.waitFor({ state: "detached", timeout: 5000 }).then(
        () => check(run, "Unlock (Enter)", true),
        () => check(run, "Unlock (Enter)", false),
      );
      check(run, "No page errors (lock)", !errors.length, errors.slice(0, 2).join(" | "));
      await ctx.close();
    }

    // Home, widgets, apps
    {
      const { ctx, p, errors } = await page([w, h], theme);
      await p.goto(base + "/", { waitUntil: "networkidle" });
      await arrive(p, w);
      const unpainted = (n) =>
        p.evaluate(
          (n) =>
            [...document.querySelectorAll(`[data-home-page='${n}'] [data-home-key]`)].filter((slot) => {
              const r = slot.getBoundingClientRect();
              const hit = document.elementFromPoint(r.x + r.width / 2, r.y + Math.min(r.height / 2, r.width / 2));
              return !(hit && slot.contains(hit));
            }).length,
          n,
        );
      const icons = await p.locator("[data-home-page='0'] [data-home-key]").count();
      check(run, "Home page 1 paints", (await unpainted(0)) === 0, `${icons} entries`);
      await p.screenshot({ path: shot("home1") });
      await p.getByRole("button", { name: "Page 2 of 2" }).click();
      await p.waitForTimeout(900);
      check(run, "Home page 2 paints", (await unpainted(1)) === 0);
      const squares = await p.locator("[data-github-widget] [data-level]").count().catch(() => 0);
      const gh = await p.locator("[data-github-widget]").getAttribute("aria-label").catch(() => null);
      check(run, "GitHub heatmap", !!gh && /contributions/.test(gh), `${squares || "?"} squares; ${gh ?? "missing"}`);
      const yt = await p.getByRole("link", { name: /^(YouTube @|Latest video)/ }).first().getAttribute("aria-label");
      check(run, "YouTube widget shows the latest video", /^Latest video/.test(yt ?? ""), yt ?? "missing");
      await p.screenshot({ path: shot("home2") });

      await p.goto(base + "/#journey", { waitUntil: "networkidle" });
      await p.waitForTimeout(1200);
      const years = await p.locator("[data-journey-row]").count();
      check(run, "Journey: story + 6 milestones", years === 7, `${years} rows`);
      await p.locator('[data-journey-row="2025"]').click();
      await p.waitForTimeout(800);
      check(run, "Journey detail pushes", await p.locator("[data-push-view]").isVisible());
      await p.screenshot({ path: shot("journey") });

      await p.goto(base + "/#projects", { waitUntil: "networkidle" });
      await p.waitForTimeout(1000);
      const txt = (await p.locator("[data-app-window]").textContent()) ?? "";
      check(run, "Projects shows Anti-Doom and StackUp", /Anti[- ]Doom/.test(txt) && /StackUp/.test(txt));

      await p.goto(base + "/#contact", { waitUntil: "networkidle" });
      await p.waitForTimeout(1000);
      check(run, "Contact form shows", await p.getByRole("form", { name: "Contact form" }).isVisible());
      await p.screenshot({ path: shot("contact") });
      check(run, "No page errors (home/apps)", !errors.length, errors.slice(0, 2).join(" | "));
      await ctx.close();
    }
  }

if (send) {
  const { ctx, p } = await page([390, 844], "light");
  await p.goto(base + "/#contact", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  await p.locator("#contact-email").fill("test@example.com");
  await p.locator("#contact-name").fill("Test");
  await p.locator("#contact-subject").fill("v10 live test");
  await p.locator("#contact-message").fill("Live check after the v10 lock screen and Journey release. One test message; no reply needed.");
  const answer = p.waitForResponse((r) => r.url().endsWith("/api/contact") && r.request().method() === "POST", { timeout: 30_000 });
  await p.getByRole("button", { name: "Send message" }).click();
  const res = await answer;
  const body = await res.text();
  await p.waitForTimeout(1500);
  const sent = await p.getByText(/^Message sent/).first().isVisible().catch(() => false);
  check("390x844 light", "Contact: ONE real message sent", res.status() === 200 && sent, `${res.status()} ${body.slice(0, 60)}; "Message sent" shown: ${sent}`);
  await p.screenshot({ path: join(outDir, "contact-sent-390x844-light.png") });
  await ctx.close();
}

await browser.close();
for (const r of rows) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.run.padEnd(16)} ${r.name}${r.detail ? `  (${r.detail})` : ""}`);
console.log(`${rows.filter((r) => r.ok).length}/${rows.length} passed`);
