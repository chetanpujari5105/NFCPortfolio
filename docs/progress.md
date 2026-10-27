# Progress

Status as of 2026-10-27 (autonomous run; specs: `claude-code-master-prompt.md` +
`claude-code-prompt-chetan-pocket-portfolio.md`). Branch: `feat/pocket-portfolio`.

## Setup (master prompt Steps 0–2)

| Item | Status | Notes |
|---|---|---|
| Step 0 — skill/MCP inventory | Done | Using: emil-design-eng / animate / review-animations / apple-design / mobile-native (Emil Kowalski skills), impeccable, web-design-guidelines, vercel-react-best-practices, deploy-to-vercel, Claude in Chrome. RareUI components via `npx shadcn add swamimalode07/rare-ui/<name>`. |
| Context7 | Done | `.mcp.json` (project scope) + CLAUDE.md rule. MCP tools load after a Claude Code restart; this run used the `ctx7` CLI (`npx ctx7 docs …`) for Motion, Zod and Zustand docs, plus the Next 16 docs bundled in `node_modules/next/dist/docs`. |
| REA | Skipped (owner's choice) | Chetan chose "Context7 only" on 2026-10-27. Behavior notes were taken by observing prsd.dev with Playwright instead → `docs/reference-notes.md`. |
| Agent Reach | Skipped (owner's choice) | Same decision. Substack is read from its public RSS feed at runtime; the YouTube channel id (`UCBfmE2dDnKSHxeIG6ACyhmw`) was found from the public channel page. |
| Reference screenshots (prsd.dev) | Done | `docs/reference/` (gitignored), desktop + phone, light + dark, plus an open/close sequence. Behavior only — nothing copied. |
| Content from chetan-website-delta.vercel.app | Done | Text, links, 10 images (→ WebP), 5 reviews (all `verified: false`). |
| Vercel projects | Done | 14 shortlisted projects, screenshots → `public/content/projects/`. |

## Build phases

| Phase | Status |
|---|---|
| 1 Scaffold | Done — tokens, fonts, flash-free theme toggle (commit `2b54104`) |
| 2 Content import | Done (`626ea33`) |
| 3 Studio + CSS phone | Done (`9798123`) |
| 4 OS shell | Done (`745ea67`) |
| 5 Apps | Done |
| 6 Spotlight / keyboard / focus / reduced motion | Done |
| 7 3D phone + Ask Chetan | Done (both behind flags, off by default) |
| 8 Polish (SEO, OG, Lighthouse, tests, README) | Done |

## Log

- **Phase 1** — Theme tokens (studio/app/finish), Geist + Archivo (expanded), pre-paint theme
  script, ⚡/🌙 toggle with circular View Transition. Lint/build OK; toggle + persistence checked
  with Playwright.
- **Phase 2** — `content/*.ts` with Zod schemas (type-only imports keep Zod out of the client
  bundle) and `npm run content:check`. Images converted to WebP; dot-grid world map rasterised from
  Natural Earth (public domain). `CONTENT.md` written.
- **Phase 3** — Studio backdrop, original CSS phone (rim/bezel/island/buttons, 3 finishes), WebGL
  wallpaper (ribbons/aurora/dusk) with CSS fallback; full-bleed below 600px, side nav on desktop.
- **Phase 4** — OS shell: hash router with depth-aware history, icon→window zoom (transform +
  clip-path), Esc / back / chevron / swipe-up to close, Socials folder, wiggle mode, ⌘K Spotlight.
- **Phase 5** — All 11 apps (Courses, Journey, Expertise sheet, Platforms, Projects, Blog via
  Substack RSS with fallback, Reviews (verified-only → "coming soon"), Services, Contact, Settings).
  `/api/contact` → Resend with Zod + honeypot + 3/hour rate limit; returns 503 without a key and the
  form shows "email me directly". Click-through script (`scripts/check-os.mjs`) passes; no console errors.
- **Phase 6** — `scripts/a11y.mjs`: axe (WCAG 2.1 AA) finds 0 violations on home + 11 apps in both
  themes. Radio groups are single tab stops with arrow keys; home arrow-key nav is edge-based;
  Spotlight restores focus on close; focus trap + return-to-icon verified; reduced motion = fade.
- **Phase 7** — 3D phone (`NEXT_PUBLIC_ENABLE_3D`): original extruded body in R3F, live OS portalled into
  drei `<Html transform>`, ±6° pointer tilt that squares up while you use the screen, lazy + desktop +
  WebGL + motion-allowed only, falls back to the CSS phone (`scripts/check-3d.mjs`). Ask Chetan
  (`NEXT_PUBLIC_ENABLE_ASK`): `/api/ask` grounded only in `/content`, refuses off-topic, 15/hour/IP,
  course cards via `{{course:id}}`, links allow-listed to the site's own URLs (`scripts/check-ask.mjs`).
- **Phase 8** — Generated OG image, original ⚡ icon + apple-icon, `sitemap.xml`, `robots.txt`, JSON-LD
  (Person + 6 Courses), canonical URL helper. Wallpaper shader now compiles off the critical path
  (idle + `KHR_parallel_shader_compile`): mobile TBT 1,330 ms → 70 ms. Playwright: 21 smoke + 18 visual
  tests across 3 viewports, all passing. README with local + Vercel steps.

## Final checks (2026-10-27, production build, local)

| Lighthouse | Performance | Accessibility | Best Practices | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Desktop | 100 | 100 | 100 | 100 | 0.7 s | 10 ms | 0 |
| Mobile (simulated 4× CPU, slow 4G) | 91 | 100 | 100 | 100 | 3.5 s | 70 ms | 0 |

Mobile LCP is Lighthouse's simulated estimate; a real 4× CPU-throttled run paints the LCP text at
~0.2 s (it's server-rendered). `npm test`: 39/39 passed. axe (WCAG 2.1 AA): 0 violations on home +
11 apps in both themes. ESLint, TypeScript and `content:check` clean.

## v3: 3D phone + real-phone feel (branch `feat/v3-3d-phone`, spec `claude-code-prompt-v3-3d-iphone-feel.md`)

**Toolbox used:** Context7 (use-gesture, drei/R3F docs; drei's `Html` source read directly in
`node_modules` for the `occlude="blending"` behaviour), emil-design-eng / animate / apple-design
(springs, interruptibility, gestures), impeccable + web-design-guidelines, vercel-react-best-practices,
Playwright (recordings, gesture tests), ffmpeg (frame analysis). New packages: `@use-gesture/react`,
`maath`. No three.js/R3F skill or plugin exists in the skills registry this session; none installed.
REA stays off (owner's earlier choice); the reference was studied with Playwright recordings instead.

- **Step 1** — Recorded 9 interactions on the reference and on the v2 build (`scripts/feel/record.mjs`,
  `analyze.mjs`), wrote `docs/feel-gap.md`. Biggest gaps: no 3D object, no drag-rotate, closes are not
  gesture-driven, no rubber-band or edge-swipe, swatches and Search don't animate.
- **Step 2** — `lib/motion.ts` named springs (snappy/smooth/gentle/launch/home), `rubberBand` +
  `useRubberBand`, momentum `project()`, shared progress values; `lib/gesture.ts` velocity + edge-zone
  helpers; store grew lock/switcher/panel/brightness/recents/icon order/status-pill events.
- **Step 3** — 3D phone is the desktop default (flag removed). Original procedural body (71.5×150×8.25
  proportions, ACES, Lightformer environment, contact shadow), vertical camera pill with two lenses,
  debossed ⚡ CP mark, pressable side pills, finish colours blend ~400 ms. The live screen DOM is *moved*
  (not remounted) into drei `<Html transform occlude="blending">` with a rounded occluder, sized 1:1
  with the CSS phone so the swap is pixel-aligned; it goes `inert` when the back faces you. Drag the
  stage to spin (6 px threshold, never from the screen), inertia, settle on the back or spring home
  after 1.2 s; tap/double-click/`R` resets; ±6° parallax. 3D chunk loads at idle; CSS phone waits up to
  900 ms for the 3D entrance. 6 new stage tests; Playwright limited to 4 workers (WebGL contention).

## Needs Chetan

- [ ] **Reviews:** all 5 are `verified: false` in `content/reviews.ts`. Confirm each is a real quote you may publish, then set `verified: true`.
- [ ] **Prompt Chaining post URL:** not found in the Substack feed/sitemap; the fallback post links to the publication home. Put the real URL in `content/blog.ts` if it exists.
- [ ] **Contact email delivery:** add `RESEND_API_KEY` (and a verified sender in `CONTACT_FROM_EMAIL`) to Vercel env vars. Until then the form shows "email me directly".
- [ ] **Ask Chetan (optional):** set `OPENAI_API_KEY` (server only) and `NEXT_PUBLIC_ENABLE_ASK=true` in Vercel, then redeploy. `OPENAI_MODEL` defaults to `gpt-5-mini`. Try a few questions before announcing it.
- [ ] **3D phone (optional):** set `NEXT_PUBLIC_ENABLE_3D=true` to try it; the CSS phone stays the default.
- [ ] **Domain:** point `chetanpujari.com` at the Vercel project (or set `NEXT_PUBLIC_SITE_URL`) so the canonical URL, sitemap and OG links match the live site.
- [ ] **Packt profile URL:** the old site's Packt links were `#`; Packt shows without a link in `content/platforms.ts`.
