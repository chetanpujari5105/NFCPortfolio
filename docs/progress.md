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
Playwright (recordings, gesture tests), ffmpeg (frame analysis), Turbopack's bundle analyzer
(`next analyze`), Lighthouse 12 (`npx lighthouse`). New packages: `@use-gesture/react`, `maath`. The existing
`cn` package now runs its build step (`npm run cn`, compiled class tables) before every build. No three.js/R3F skill or plugin exists in the skills registry this session; none installed.
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
- **Step 4** — Launch/close rebuilt: window grows from the exact origin rect (icon, widget or switcher
  card) with x/y/scale/radius on the `launch` spring, icon art → app in the first 40% with blur → sharp,
  home + wallpaper recede to 0.9 with dim and blur. Home-indicator swipe is fully interactive (follows
  finger, shrinks to 0.6, moves sideways) and flies back into the icon with the release velocity, or
  springs back open. Swipe-and-hold (300 ms), double-tap or Ctrl+↑ opens the app switcher (live inert
  cards, depth carousel, swipe a card up to close, tap to open from the card). Switching apps is a quick
  out-to-home then in-to-icon. All app chunks are warmed at idle (no blank launch frames). 5 gesture tests.
- **Step 5** — Lock screen once per session (skipped for deep links): live clock/date, a Substack
  notification, swipe up with rubber-band (commits past 30% or on a flick), tap/Enter also opens; icons fly
  in 20 ms apart on the gentle spring. Home has 2 pages with dots (page 2: latest-post, YouTube and
  Expertise widgets), swipe/trackpad/arrow paging with projection and rubber-band; pull down anywhere for
  Search with proportional dim/blur. Icon press 0.92 on the snappy spring with release overshoot, cancels
  after 10 px. Long-press (500 ms) → jiggle with random phase; drag to rearrange (live pointer mapping, so
  float/parallax can't skew it), springs reflow, order saved; "Done" exits. Dock magnifies to 1.15. Idle
  float ±3 px / 6 s on the stage (compositor-only, pauses under the pointer). Tests: lock, pager (incl. a
  swipe started on a link widget), pull-to-search, jiggle reorder + persistence, float.
- **Step 6** — In-app physics live in the shared shell (`app-shell.tsx`), so every app gets them:
  frosted bar with back/actions that never scrolls away and a small title that fades in as the large
  one slides under it (large title grows slightly on pull); rubber-band overscroll at both ends for
  wheel and touch (tighter band for trackpad momentum). Push views: parent shifts −30% and dims,
  interactive edge-swipe back from the left 24 px (14–40 px where the mobile browser owns the edge),
  release velocity carried into the close. Sheets: medium/large detents, grabber drag with projection,
  app behind scales to 0.94 with rounded corners; grabber is also a button. Swipe-left actions: Blog
  "Share", Courses "Enroll" (full swipe runs it). Blog pull-to-refresh hits the new `/api/feed` route
  (pill reports the result; a Refresh button does the same). Chips/segmented use a `layoutId`
  indicator on the snappy spring. 7 new tests (`tests/inapp.spec.ts`), visual baselines refreshed.
- **Step 7** — System UI. The camera cutout is now a status pill that grows sideways (own spring,
  content blurs in) for "Message sent", "Link copied", "Theme: Dark/Light" (from any toggle) and a
  progress ring while Blog refreshes; tap collapses it; a polite live region reads the same text.
  Control Center: pull down from the top-right corner (follows the finger, rubber-bands past open,
  settles with velocity) or tap the battery corner; dark mode, reduce motion, larger text, finish,
  wallpaper, brightness (dims the screen), Now Playing (latest video or the channel). Closes by swipe
  up, Esc (focus returns) or tapping outside; Settings has a Control Center row as the no-gesture
  path. Notification banner 8 s after unlock if Blog wasn't opened, once per session; tap opens the
  post from the banner, swipe up/Esc/timeout dismisses. Haptic ticks on toggles and thresholds. 6 new
  tests (`tests/system.spec.ts`); tests opt out of the banner via a fixture option.
- **Step 8** — Phones: the phone is the viewport (fixed, 100dvh, no frame/buttons/cutout), safe-area
  padding everywhere, page never bounces (`overscroll-behavior: none`), no tap flash or double-tap
  delay (`touch-action: manipulation` at zero specificity so gesture surfaces keep `touch-none`), no
  long-press callout on home/lock/banner/panel, 16 px form fields (no focus zoom), in-app edge swipe
  starts inside the browser's own back-swipe strip. Installable PWA: `app/manifest.ts` (standalone,
  portrait), 192/512 + maskable icons rendered from the site's bolt (`scripts/make-icons.mjs`),
  Apple web-app meta (black-translucent status bar). Launch before an app's chunk arrives lands on a
  skeleton instead of a blank screen. 4 new phone tests drive real touch events over CDP. Fixed a
  step-7 CSS slip that un-hid the frame's buttons on phones.
- **Step 9** — Speed. Initial JS on `/` is **196.6 KB gzipped** (was 290 KB at step 8;
  `node scripts/js-budget.mjs`, legacy `nomodule` polyfill excluded since modern browsers never fetch
  it). About 134 KB of that is React + Next itself. How: closed layers (app window, switcher,
  Spotlight, Socials, Control Center, banner) load after hydration; `LazyMotion` + `m.*` with the
  feature bundle loaded async; the home path animates motion values through `animateTo`
  (`animateSingleValue`) instead of `animate`, which also carries sequences and element/WAAPI
  animation; page-2 widgets load after hydration (takes `next/image` with them); the status pill
  drops `AnimatePresence`; `cn` is a plain join, and Tailwind conflict merging (`cnMerge`, `cn`
  package with tables compiled from our own classes before every build) is only used by the app
  shell and Control Center, which load later. The 3D stage now loads on the visitor's first pointer
  move / wheel / key / touch (noted by the pre-paint script, so a move before hydration counts);
  its WebGL setup is one 70–90 ms task, so it never runs during first load or an interaction. The
  lock-screen clock and date are filled by an inline script right after the markup, so the largest
  text paints with the page and no longer shifts layout (CLS 0.044 → 0).
  Long tasks during 23 desktop + 21 phone interactions: **none** (`node scripts/longtasks.mjs`).
  Lighthouse 12 (production build, local): desktop **100 / 100 / 100 / 100** (LCP 0.7 s, TBT 0 ms);
  mobile **91 / 100 / 100 / 100**, steady over 4 runs (simulated slow 4G + 4× CPU, LCP 3.5 s
  estimate); with real DevTools throttling mobile is 98 (LCP 1.6 s). `npm test`: 119 passed + 1
  flaky (the desktop jiggle-drag test, which passes on its retry under full parallel load) /
  24 skipped by viewport. Re-recorded all scenarios: `docs/feel-gap.md` "After".

## v4: stable phone, flagship look, real icons, GitHub (branch `feat/v4-polish`, spec `claude-code-prompt-v4-stable-phone-real-icons-github.md`)

- **Problem 1: stable phone.** Reproduced first (`tests/stability.spec.ts` failed on v3: a quick 10 px wobble on the frame/stage — what a real click often is — crossed the 6 px threshold and flicked the phone; flicks spun 988°; the idle float moved it 3 px).
  Fix: our own pointer state machine replaces use-gesture. A press only becomes a turn past 12 px *and* mostly sideways, never from the screen or anything pressable; rotation follows 1:1 (0.6°/px), pitch ≤ ±12°; release projects velocity ≤ 90° and a critically damped spring (ω 14, ~450 ms, no overshoot) settles on the nearest face and stays. Removed tap/double-click/`R` resets, the 1.2 s return and the idle float; a **Flip** button sits in the bottom-left studio corner. Parallax ±3° (0.35 s) holds still over the screen, while any app/layer is open and for 600 ms after any press.
  27 stability tests (clicks, double-clicks, jitter, sloppy clicks, rapid clicks on screen/frame/stage, icon + in-app scroll, 200 px → 180° → 0°, 30 px → 0°, flick ≤ one half-turn, vertical drag, pitch, Flip, perfectly still at rest; box tolerance 0.5 px). Captures: `docs/v4/before/` (`stage-frames.png` is the click/drag video as frames).

## Needs Chetan

- [ ] **Reviews:** all 5 are `verified: false` in `content/reviews.ts`. Confirm each is a real quote you may publish, then set `verified: true`.
- [ ] **Prompt Chaining post URL:** not found in the Substack feed/sitemap; the fallback post links to the publication home. Put the real URL in `content/blog.ts` if it exists.
- [ ] **Contact email delivery:** add `RESEND_API_KEY` (and a verified sender in `CONTACT_FROM_EMAIL`) to Vercel env vars. Until then the form shows "email me directly".
- [ ] **Ask Chetan (optional):** set `OPENAI_API_KEY` (server only) and `NEXT_PUBLIC_ENABLE_ASK=true` in Vercel, then redeploy. `OPENAI_MODEL` defaults to `gpt-5-mini`. Try a few questions before announcing it.
- [ ] **YouTube widget:** the channel's public feed has no videos right now, so the page-2 widget links the channel. It switches to the latest video (thumbnail + title) by itself once one is public.
- [ ] **Icon rearranging:** jiggle-mode reordering covers the page-1 app icons; widgets, the dock and page 2 stay fixed. Say if you want those movable too.
- [ ] **Domain:** point `chetanpujari.com` at the Vercel project (or set `NEXT_PUBLIC_SITE_URL`) so the canonical URL, sitemap and OG links match the live site.
- [ ] **Packt profile URL:** the old site's Packt links were `#`; Packt shows without a link in `content/platforms.ts`.
