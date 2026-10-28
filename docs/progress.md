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
- **Problem 4: GitHub heatmap.** Username `chetanpujari5105`, from the remotes of Chetan's other local repos (`gh` isn't installed, this repo has no remote); it lives in `content/profile.ts` as `github` and as a GitHub social. `lib/github.ts` `getContributions()` uses GraphQL `contributionCalendar` when `GITHUB_TOKEN` is set, otherwise parses the public `github.com/users/<user>/contributions` cells (date, level, count from the tooltips); `"use cache"` with a 6 h revalidate; both failing → an empty grid with "View on GitHub".
  The full-width widget opens page 2 (then Blog, YouTube, Expertise): the GitHub mark, username, total, the last 17 weeks in 5 greens tuned for both themes, today's square breathing, columns fading in the first time page 2 is in view, tap → profile, label "GitHub: 967 contributions in the last year…". Fits with no scrolling at 390×844 and on desktop (`tests/github.spec.ts`, also the parser). Brand marks are copied from `simple-icons` at build time (`scripts/brand-icons.mjs`), split so the home bundle carries only the social marks: initial JS **199.7 KB**.
- **Problem 3: real brand icons, polished own icons.** Every brand link shows its official mark on the brand's own tile (LinkedIn #0A66C2, X black, YouTube red-on-white, Instagram gradient, Substack, Udemy, GitHub; Skillshare, Coursera, Packt, O'Reilly in Platforms): Socials folder (and its preview), LinkedIn + X straight on page 1, YouTube on page 1, Platforms, Control Center "Now playing", Settings → Find me, Contact. Marks come from `simple-icons` (CC0); LinkedIn (dropped from simple-icons at LinkedIn's request) from Font Awesome Free (CC BY 4.0, credited in Settings → About → Credits).
  Own icons stay original: every tile is cut from one superellipse (n = 5) mask, with a 3-stop gradient, soft top highlight, inner edge shade, outer shadow on the unmasked tile, and glyphs lit top-down with a shadow in the tile's own deep colour; per-glyph optical sizing (`data-glyph`). Checked at 60 and 180 px (`scripts/icon-sheet.mjs`, `docs/v4/p3/`).
  Found and fixed a build bug: Turbopack's persistent build cache (on by default in Next 16) kept serving an old `globals.css`; `turbopackFileSystemCacheForBuild: false`.
- **Problem 2: premium flagship.** No free, properly licensed, unbranded model beat a procedural one (Sketchfab CC0/CC-BY downloads need an account; Poly Pizza, Kenney and Quaternius phones are low-poly), so the procedural device was rebuilt to the spec. One set of ratios (`lib/device.ts`) drives both the CSS and the 3D phone: 77.5 × 163.5 × 8.8 mm, corner radius 12.5% of the width, a true-black bezel of 1.4% of the width all round, concentric display corners, and a pill cutout 30% × 3.6% of the screen.
  Frame: flat sides with a thin, softly rounded polished chamfer; brushed anodized walls (roughness map with grain + anisotropy along the perimeter); thin bright Lightformer strips beside the phone draw the crisp chamfer line, strips behind it light the walls. Slim action button, volume up/down and side button, all proud of the frame in the same metal, plus a flush sapphire camera control. A faint glass sheen over the live screen drifts with the parallax. Status bar laid out like a device: time and indicators each centred in their "ear" beside the pill, system font.
  Back: an original full-width camera plateau in the body's metal, three lenses in a row with flash + sensor at the end, the ⚡ CP mark centred, no other logos. Finishes are now anodized metal (`FINISH_INFO.frame/back`, swatches show it): Electric → cosmic orange-gold, Graphite → space black, Chai → desert titanium; the UI accent and wallpaper are unchanged. Captures: `docs/v4/p2/` (front/back × 3 finishes × 2 themes).

- **Home-screen polish (against the reference: quality only, our content).** Icon size and row rhythm already matched (≈ 60 px tiles, ≈ 99 px row pitch at 390 px), so the work went into the chrome. The dock is wider (16 px margins) and concentric with its icons, in a heavier frost (blur 28 px, saturate 180%) with a hairline ring and lit top edge; the same `glass-chrome` material is on a slimmer Search pill with smaller page dots. Labels are 11–11.5 px (scaled to the icon), with a lighter shadow. Home widget corners scale with the icon (`widget-r`, 0.37 × icon) instead of a fixed 22 px. The ribbons wallpaper gains a thin rim light on each band edge and fine grain, giving the glass detail to blur over. The Blog widget's title clamps to two lines over a deeper scrim (`block` was cancelling `line-clamp`).
  Budget: the full About `story` moved from `content/profile.ts` to `content/story.ts`, because every home widget that imports `profile` for a few short fields was shipping it. Initial JS is **199.4 KB** gzipped (budget 200 KB). No long tasks across 23 desktop and 21 phone interactions. Lighthouse 12 (local production build): desktop **100**/100/100/100 (LCP 0.8 s, TBT 0 ms); mobile **90–91**/100/100/100 (simulated LCP 3.5 s, TBT 60 ms; a cold-server first run scored lower and was re-run). Tests: 143 passed, 64 skipped by viewport. Final captures: `docs/v4/after/` (front/back × 3 finishes × 2 themes, page 2, phone layout, `stage-frames.png` from the click/drag video).

## v5: fit every phone, real home-screen editing, speed (branch `feat/v5-mobile`, spec `claude-code-prompt-v5-fit-every-phone-folders-speed.md`)

- **Problem 1: fit every phone.** Reproduced first (`tests/fit.spec.ts` over a 17-size matrix in `tests/devices.json`, incl. 392×690 Brave with toolbars): on v4, 11 of 17 sizes clipped the home screen (at 392×690 LinkedIn/X on page 1 and YouTube/Expertise on page 2 ended 35–90 px under the Search pill) and both landscape lock screens were cut off.
  Fix: the home screen is now data (`lib/home.ts`): an ordered grid that flows across as many pages as it needs, a dock and folders (`pp-home-v2`, migrated from the v4 icon order). `useHomeLayout()` measures the screen and its safe areas on every resize and works out columns (3 under 340 px, 4 on phones, 6–7 in landscape), icon size (`min(width-based, height-based)`, 48–68 px) and rows (up to 6; spare height opens the rows up); widgets take whole cells (Impact, GitHub, Blog 4×2; Work, YouTube, Expertise 2×2) and anything that doesn't fit starts the next page, with page dots following. The phone is sized by the visual viewport (`--vvh`/`--vvt` from the init script, falling back to `dvh` → `svh` → `vh`), `interactive-widget=resizes-content`, all four safe areas, `text-size-adjust: 100%`, the page itself never scrolls, and screens under 520 px tall (a phone on its side) are "phone mode" too. Widgets size their contents in container units of their own tile; the empty YouTube box is now a channel card (logo, @chetanpujari, "Watch on YouTube") and Expertise a real stacked-cards widget. Apps clear the home indicator, read as a 680 px column in landscape and keep a focused field above the keyboard; Contact's Send moved into the frosted bar; Control Center has a landscape layout; the browser bar takes the wallpaper's top colour (sampled by the shader) or the open app's background.
  Result: 85/85 fit tests (home pages, lock screen, Search/Control Center/switcher, every app's end, Contact with the keyboard up) on all 17 sizes; contact sheets `docs/v5/fit/contact-sheet-{light,dark}.jpg` (per-size PNGs regenerate with `node scripts/fit-shots.mjs`, gitignored).

- **Problem 2: speed.** The trace on `main` showed every early tap waiting ~350 ms for `next/dynamic` chunks behind Suspense, then 30–45 ms of forced layouts in the click handler. Now:
  - A loader that never suspends (`lib/lazy.tsx`). Every app chunk is on the device at idle (1.5 s) or on the first touch.
  - The window shell renders in the tap's frame. The tap avoids forced layouts. Nothing is blurred, backdrop-filtered or layer-promoted while the window moves.
  - A Serwist service worker (`sw/sw.ts`, built before `next build`):
    - Caches the shell, chunks, fonts and icons; images and `/api/feed` are stale-while-revalidate.
    - Pages are network-first, so a deploy always wins online. Offline works after one visit.
  - Results at 4× CPU, one worker. Launch:

    | | Before | After |
    |---|---|---|
    | Window mounted | 350 ms | 46–51 ms |
    | Readable | 370–470 ms | 100–180 ms |
    | Settled | 805–877 ms | 386–425 ms |

    App switch went from 2.6 s to 351 ms. Initial JS is 199.8 KB. Lighthouse mobile went from 91 to 93; desktop is 100. Repeat visits load in about 70 ms.
  - Full numbers and the before/after videos are in `docs/v5/speed.md`.
  - `npm test`: 228 passed. `tests/speed.spec.ts` still fails its strict "moving ≤ 50 ms" check at 4× CPU (57–62 ms). It passes unthrottled (41–50 ms); what's left is a ~25–30 ms headless-Chromium stall before the first frame (see speed.md).

- **Problem 3: home-screen editing.** Tests first (`tests/home-edit.spec.ts`, 15 tests with mouse and CDP touch, incl. the 320×568 and 392×690 fit checks). The editor is one lazy chunk (`components/os/HomeEditor.tsx`), fetched on the first press, so initial JS stays at **199.1 KB**.
  - A 500 ms long-press (haptic tick) or the context menu (right-click, Shift+F10, the menu key: Open, Share, Edit Home Screen, Remove App) starts edit mode. Icons wiggle with "–" badges, Done is top right, + (App Library) is top left. Drag moves apps, widgets, folders and dock icons, holding at an edge for 600 ms turns the page, and the dock takes four. Dropping and holding 400 ms on an app makes a named folder (Social, Learn, About Me, Work, else "Folder") that opens ready to rename. Folders page past 9 apps, and dragging the second-last app out dissolves one. Removing an app goes through an action sheet; Settings stays pinned. The App Library and a confirmed reset are also in Settings → Home Screen. Keyboard: arrows move, F makes a folder, Delete removes. Everything is announced to screen readers, and reduced motion swaps the wiggle for a fade.
  - Fixed on the way: a deep link that mounted before Motion's features loaded showed the launch splash in about 1 load in 4 (`tests/visual.spec.ts` flake), and the Control Center pull handle covered Done on phones. `npm test`: 243 passed; the 5 throttled "moving ≤ 50 ms" checks still fail as in P2. Long tasks in the editing tour: none (speed.md).
- **Deployed.** The first push failed on Vercel: Next 16's build adapter moves `.next/static`, so the service-worker step found no fonts, and a `sw.js` written after the build wouldn't have shipped. The worker is now built before `next build`. Live: `/sw.js` 200, and the site reloads and opens apps offline. Fit-shots on production cover all 17 sizes. Speed on production at 4× CPU has a few 51–92 ms tasks that local runs don't (speed.md, "Still open").

## v6: icons native to the iPhone 18 Pro Max model (branch `feat/v6-iphone-icons`)

- **Step 0.** The iPhone 18 Pro Max Burgundy model swap from the last session is committed (`40d861b`). The raw export (`apple-iphone-18-pro-max-burgundy-2026/`, 4 MB, no licence file, made with "Binkies MDM") stays local and gitignored. Only the optimized GLB in `public/models` ships.
- **Toolbox.** I used emil-design-eng, animate, apple-design, impeccable (polish pass and detector) and web-design-guidelines, plus Context7, Playwright for every capture, and ffmpeg for contact sheets. For icon or SVG skills, the only one from an established source was `better-auth/better-icons` (MIT, 1.4K stars, Iconify search), and I installed it globally. The `icon-design` skills come from individual authors with under 500 installs, so I skipped them. No glyph came from a library: all are drawn by hand.
- **Own icons (10 apps + Ask).** Every tile is cut by the n = 5 superellipse mask, never by border-radius.
  - **Layers:** a 3-stop face gradient, a soft top highlight, a faint bottom inner shadow, and a thin edge light. The edge light is drawn as the squircle minus a squircle inset by about 1% of the icon (`mask-composite: exclude`), so it follows the true shape.
  - **Glyphs:** a new original set on one 24-unit grid (`components/os/icons.tsx`). They are solid shapes with no hairlines. Corners are rounded by a stroke painted with the fill, secondary parts sit at lower opacity for a layered look, and every glyph has a slight drop shadow in the tile's own deep colour. They sit at one optical size (58%, with pointy shapes at 60–62% and boxy ones at 55%).
  - **New concepts:** Platforms is now stacked layers (it was a thin-stroke globe). Blog is a pen nib (it was a newspaper). Settings is two switches on a white tile; the grey gear was too close to Apple's Settings icon. Services is the CP bolt in gold on an ink tile, because white on yellow was unreadable. Nothing copies Apple's Safari, Photos, Mail, Notes, Settings or App Store.
  - **Faces:** a new `face` field in content (`color`, `light` or `ink`) and one `.tile-face` class. The launch overlay, App Switcher, folder previews, lock-screen notification and banner all draw the same face as the home tile, as a squircle. No rounded rects are left.
  - **Dark mode:** icons go dark the way the phone does it. The tile turns near-black and the colour moves into the glyph.
- **Brand icons.** LinkedIn, X, YouTube, Instagram, GitHub, Substack and Udemy keep their official marks on brand-colour tiles: simple-icons, plus Font Awesome for LinkedIn. They share the size, squircle, shadow and edge light, but keep a flat face. White tiles (YouTube) get a shaded hairline edge, and they never go dark.
- **Home-screen rhythm.** Measured on 390×844, 430×932 and the CSS phone at 834×1112.
  - **Icons:** 0.81 of the cell, which gives 60 px at 390 and 66 px at 430, the same on the CSS phone.
  - **Labels:** the system face at a fifth of the icon (12 px), weight 450, with a firmer shadow that holds up over the Electric and Chai gloss.
  - **Dock:** its own thicker, brighter frost (`.dock-glass`) with a lit top edge and corners that follow its icons.
  - **Wallpaper:** Burgundy now has its own wine tint (`--wall`), so the ribbons gloss to burgundy instead of pink.
  - **Press:** icons darken on press, the way a phone's do: an opacity layer, 80 ms in and 200 ms out, cleared when a swipe cancels the press.
- **Back logo.** The model's back shows the manufacturer logo, and its licence isn't confirmed. Unless `NEXT_PUBLIC_SHOW_MODEL_LOGO=true`, the logo mesh is hidden and a ⚡ CP mark takes its exact place, in satin metal that follows every finish. Settings → Credits and the README now say the phone is a third-party model, and that iPhone is a trademark of Apple Inc.
- **Flaky smoke test.** It was `smoke.spec.ts › every app opens…` (desktop), the one flaky test in the model-swap session; the same race also hit Spotlight under load. The cause is a real bug. When the 3D phone goes live mid-session, the live screen subtree is moved into it, and moving a subtree blurs whatever was focused inside it, such as Spotlight's field or an open app. `Phone.tsx` now restores focus after the move. The smoke tests also wait (`settled()` in `tests/fixtures.ts`) until the phone has arrived before pressing anything.
- **Camera control.** The press still works: it presses in while held, springs back on release, and doesn't turn the phone. A new stage test drives it, and the 3D phone publishes `data-camera-control` and its on-screen position at rest.
- **Captures.** Before/after for 4 finishes × light/dark: 3D front, home crop and back at 1440×900, the phone layout at 390×844, and icon sheets at 60 and 180 px (`node scripts/v6-shots.mjs <dir>`, then `node scripts/contact-sheet.mjs <dir>`). Contact sheets: `docs/v6/before/sheets/`, `docs/v6/after/sheets/`. The full PNGs are gitignored.
- **Visual baselines (updated on purpose).** The 6 home baselines changed (`home-{light,dark}-{desktop,tablet,phone}`) because the icons, labels, dock and wallpaper changed. The courses and settings baselines still match and were left alone.
- **Tests.** `npm run lint && npm run typecheck && npm run build && npm test`: lint, typecheck and build pass. Tests: **244 passed, 0 flaky**, 276 skipped by viewport. The run before this work had 243 passed; the new camera-control test makes 244. The same 5 throttled "window moving ≤ 50 ms" checks still fail (`speed.spec.ts`, phone at 4× CPU). Run alone on one worker they measure 61–68 ms. v5 recorded 57–62 ms, and this branch's own baseline run (before the icon work) failed them too under full load (71–96 ms vs 61–121 ms now; the parallel numbers are noisy).

## v6 follow-up: match the quality of the reference home screen (same branch)

- **Measured, not guessed.** `scripts/gap-measure.mjs` measures the same elements on the reference (prsd.dev) and on this site, at 1440×900 and 390×844, in light and dark: rects, computed styles, and the glyph box and face colours of every tile. The table is in `docs/v6-gap.md`; the raw numbers are in `docs/v6/gap-measurements-{light,dark}.json`. Only measurements were taken: no code, text, images, icons, fonts or 3D model. The side-by-side crops (`docs/v6/compare/*.png`) contain the reference's screenshots, so they stay local (gitignored).
- **Tiles.** Each tile is now one smooth 2-stop vertical gradient. The edge ring, inner shadow, radial highlight and glyph drop shadow are gone. There's one soft outer shadow (3/60 of the icon), as on the reference. The superellipse mask stays.
- **Glyphs.** They're flat white silhouettes in one tone. The opacity layers are gone, and parts are told apart by gaps and cut-outs. I redrew the paper plane (one shape with its fold cut in) and Settings (an "on" switch and an outlined "off" one). The cap, layers and rocket got clearer gaps. Each glyph has its own optical size, and every one now fills 57–59% of the tile at its widest (it was 42–51%).
- **Faces.** The `face` field (light / ink) is removed. Settings is a grey gradient and Services a graphite one, both with white glyphs. The other colours were retuned as 2-stop pairs.
- **Dark mode does what the reference does: nothing.** The home screen is now identical in light and dark: icons, widgets (tokens pinned light inside `[data-widget-tile]`), dock, Search pill, folder and wallpaper (the ×0.82 dark dim was removed). Apps still follow the theme.
- **Labels.** 10 px (`.17` of the icon, 10–11 px), weight 400, line height 1.35, and the reference's `0 1px 7px` shadow plus a tight one for our brighter gloss. The gap below the icon is `.11` of the icon. The font is `system-ui`; no Apple font is named or bundled.
- **Brand tiles.** LinkedIn and X marks went from about 45% to 55–57% of the tile, to sit with the app glyphs. The official marks and colours are unchanged.
- **Widgets and cards.** The "stretched" corners were a bug: an edit-mode rule set `border-radius: 24%` on every widget tile, which made 83×40 px elliptical corners. Every widget now has one 26 px radius (`.44` of the icon). There are two opaque materials, as on the reference: `.widget-light` (white, hairline, soft `0 2px 8px` shadow) and `.widget-graphite` (Impact: an opaque graphite gradient with a lit top edge, replacing the washed-out glass). The Work widget got the reference's hierarchy: a 9 px semibold kicker and a big tight title (23 px at 390, was 16.7). The blog widget's scrim is darker, so the title holds up over busy covers.
- **Rhythm.** Row pitch is 102 px at 390 (was 109; the reference is 100). The dock spreads its icons edge to edge, with a 92 px pitch like the reference (was 84). The dock sits 12 px off the bottom (was 8), and the dock and Search pill use the reference's frost (`/.19` + 22 px blur; `/.16` + 18 px). The label height is computed per icon size, so a small landscape phone keeps 3 rows.
- **Captures.** `docs/v6/gap-after/sheets/` (4 finishes × light/dark: 3D front, home, back, mobile, icon sheets).
- **Visual baselines (updated on purpose).** The 6 home baselines again (`home-{light,dark}-{desktop,tablet,phone}`). Courses and settings still match.
- **Tests.** Lint, typecheck and build pass. Tests: **244 passed**, 276 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks as before. On one worker they now measure 56–62 ms (v6: 61–68 ms), because the flatter tiles are cheaper to paint.

## Needs Chetan

- [ ] **Real-device check of v5:** iPhone Safari, Android Chrome, Brave, Samsung Internet, and the LinkedIn and Instagram in-app browsers.
  - Home fits with the toolbars shown, in landscape, and in Contact with the keyboard up.
  - Launch feel: does the window start growing on the tap itself?
  - A repeat visit loads instantly, including in airplane mode after one visit.

- [ ] **Reviews:** all 5 are `verified: false` in `content/reviews.ts`. Confirm each is a real quote you may publish, then set `verified: true`.
- [ ] **Prompt Chaining post URL:** not found in the Substack feed/sitemap; the fallback post links to the publication home. Put the real URL in `content/blog.ts` if it exists.
- [ ] **Contact email delivery:** add `RESEND_API_KEY` (and a verified sender in `CONTACT_FROM_EMAIL`) to Vercel env vars. Until then the form shows "email me directly".
- [ ] **Ask Chetan (optional):** set `OPENAI_API_KEY` (server only) and `NEXT_PUBLIC_ENABLE_ASK=true` in Vercel, then redeploy. `OPENAI_MODEL` defaults to `gpt-5-mini`. Try a few questions before announcing it.
- [ ] **YouTube widget:** the channel's public feed has no videos right now, so the page-2 widget links the channel. It switches to the latest video (thumbnail + title) by itself once one is public.
- [ ] **Home-screen editing on a real phone:** on touch a long-press goes straight into edit mode (as on iOS when you keep holding); the Open/Share/Remove menu is right-click, Shift+F10 or the menu key. Say if you'd rather have the menu on touch too. Check the haptic tick on Android (iOS Safari has no vibration API).
- [ ] **Domain:** point `chetanpujari.com` at the Vercel project (or set `NEXT_PUBLIC_SITE_URL`) so the canonical URL, sitemap and OG links match the live site.
- [ ] **GitHub username:** the heatmap uses `chetanpujari5105`, found in the remotes of your other local repos. If that's wrong, change `github` (and the GitHub social) in `content/profile.ts`.
- [ ] **GitHub token (optional):** set a fine-grained `GITHUB_TOKEN` with no scopes (public data only) in Vercel to read the calendar over GraphQL. Without it the widget parses the public contributions page, which works today but could break if GitHub changes that markup.
- [ ] **3D model licence:** the iPhone 18 Pro Max model came with no licence file; its export says "Binkies MDM". Find where it came from and confirm the licence allows use on a public site, then put the terms in `public/models/LICENSE-iphone-18-pro-max.txt`. Until then the back shows the ⚡ CP mark. Set `NEXT_PUBLIC_SHOW_MODEL_LOGO=true` only if the licence (and Apple's trademark rules) allow showing the manufacturer logo.
- [ ] **Icon review:** every own-app icon is now a flat white glyph on a 2-stop gradient, the same in light and dark. Settings is switches on grey, Services a white bolt on graphite, Platforms layers and Blog a nib. See `docs/v6/gap-after/sheets/icons-light.jpg` and `docs/v6-gap.md`. Say if any concept or colour should change.
- [ ] **Packt profile URL:** the old site's Packt links were `#`; Packt shows without a link in `content/platforms.ts`.
