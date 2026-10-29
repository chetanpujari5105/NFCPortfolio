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

### v6 follow-up, second pass: home icons vanishing on the 3D phone

- **Symptom.** On the desktop 3D phone, a few seconds after load the home grid (icons, folder, widgets) stopped painting. The dock, Search pill, status bar and wallpaper stayed. I reproduced it in Chrome (DPR 2, 1920×999 CSS px) by moving the mouse across the studio, which tilts the phone, and by flipping to the back and returning.
- **Root cause.** The home pages had `content-visibility: auto` (added in v5 for speed). Chrome decides whether such an element is on screen with its own intersection check. Inside the 3D phone's CSS 3D transform, that check misjudges the current page after a tilt or a flip and stops painting it. Its contents stop hit-testing too, so icons can't be clicked. Layout, opacity and visibility stay normal, which is why size, opacity and visibility checks passed. It was not the layout: `homeGeometry` already ignores a 0×0 measure (`if (!W || !H) return`) and never goes below 2 rows, and the logs showed the same rows, icon size (53.5 px) and grid size (347×564) throughout.
- **Fix.** `Pages` in `HomeScreen.tsx` now decides itself, from the pager's own position (`homePagerX`) and the grid's width: a page gets `data-offscreen` (`content-visibility: hidden`) only while it is wholly off to the side, and stays visible otherwise. The speed win stays (page 2's heatmap is skipped while page 1 shows). There's no delay or timer. A first version measured the Apps nav, which is `display: contents` and 0 wide; it now measures `[data-home-grid]`.
- **Regression tests.** `stage.spec.ts`: for light and dark (Burgundy, 1440×900), every page-1 slot must hit-test to itself (`unpainted()` in `tests/fixtures.ts`), sampled every 500 ms for 15 s, after the mouse moves, and after a flip to the back and back again. It failed on the old build right after the mouse moved. `paint.spec.ts` (every project): the current page paints and the other page is skipped, both ways. Checked by script at 390×844, 834×1112 and the CSS fallback phone (reduced motion, 1440×900), in all 4 finishes, light and dark: every case paints, before and after a page swipe.
- **Tests.** Lint, typecheck and build pass. Tests: **249 passed** (5 new), 280 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks, 57–61 ms on one worker (unchanged).

### v6 final polish: dock, full rows, label contrast, home indicator, wide widget, status bar

Measured again with `scripts/gap-measure.mjs` (light and dark); the numbers are in the "Final polish" section of `docs/v6-gap.md`. The icon artwork and concepts are unchanged.

- **Dock.** It now matches the reference at 390×844: 360×87, 28 px off the bottom, 17 px below the Search pill (was 360×84, 12 px, 10 px). The rules scale with the screen: bottom margin 3.3% of the screen height (on a real phone at least the safe-area inset), pill-to-dock gap 2% of it, dock padding `.224` of the icon. On the 3D phone that gives 25 px, 15 px and a 77 px dock (reference: 24.7, 13.4, 78.7).
- **Full rows on page 1.** The last row held only LinkedIn and X. Udemy and GitHub moved up beside them from the Socials folder, so page 1 is six full rows of four on every portrait screen (phone, CSS phone, 3D phone). Socials keeps Instagram, AI Instagram and Substack. No link was removed. A layout someone already saved (`pp-home-v2`) keeps its own order until they use Reset Home Screen.
- **Label contrast.** The wallpaper shader now compresses highlights behind every label row (soft knee, luminance cap ~0.16) and, more gently, everywhere else (~0.58), in light and dark. The label rows are read from layout only when the home geometry, layout or lock state changes, and the effect fades out on the lock screen. The CSS fallback gradient darkens its brightest glow too. `scripts/label-contrast.mjs` (new) measures every page-1 label over the live wallpaper alone: at 390×844, 834×1112 and 1440×900, 4 finishes, light and dark, **every label is at least 5.6:1** (was as low as 1.0:1; Burgundy Platforms was 1.8). Platforms, Reviews, Projects and Settings are 5.7–7.6 on every finish. The dock has no labels.
- **Home indicator.** The drawn phones (3D and CSS) get a thin white bar, 35% wide and 5 px tall, 1% above the bottom edge, under the dock. It is `pointer-events: none`, so it never takes a tap or the swipe-up. A real phone draws its own, so it is hidden there.
- **Impact widget.** It is the reference's wide-widget height: `2.48` icons, 149 px at 390 and 132.7 at 1440 (reference: 149 and 132.1), with 13 px padding. It is centred in its two-row slot. The numbers went up to 25 px / 700 (was 15–20) and the labels to 11 px, the reference's title and secondary sizes. The map takes 40% of the width to make room.
- **Status bar.** The time is 15 px / 600 / −0.4 px, as on the reference (was 14.2 px / 600 / −0.01 em). The font stack no longer names `-apple-system`.
- **Visual baselines (updated on purpose).** The 6 home baselines: `home-{light,dark}-{desktop,tablet,phone}`. Courses and settings still match.
- **Tests.** Lint, typecheck and build pass. Tests: **249 passed**, 280 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks as before. Alone on one worker they measure 57–65 ms (last pass: 57–61). In the full parallel run they read 65–116 ms, because the other workers compete for the CPU.

## v7: iOS 18 App Icons pack (branch `feat/v7-ios18-icons`)

- **Source.** "iOS 18 App Icons • Free Resource" by David Akhmedbayev (Figma Community, CC BY 4.0), from your duplicated copy. No `FIGMA_TOKEN` was set, so the icons were exported through your logged-in Figma session in Chrome (Export panel, SVG + PNG @3x; no login step was needed). A temporary export frame was added and then removed, so the file is as it was. All nine are pure vector (no raster images): Maps, Settings and Wallet have drop shadows, and Photos has blend modes.
- **Mapping.** Courses → Books, Journey → Maps, Platforms → App Store, Reviews → Photos, Projects → Files, Settings → Settings, Blog → Notes, Services → Wallet, Contact → Mail. **Expertise keeps its original sparkles icon:** the file has no Shortcuts icon (checked on every page, by layer name and text). YouTube, LinkedIn, X, GitHub, Udemy and Instagram stay official brand tiles.
- **Assets.** `scripts/ios18-icons.mjs <export dir>` opens each icon's own rounded clip to full bleed, so the site's squircle mask is the only edge (its n = 5 corner meets the diagonal at 56.12/60; the pack's rx 13.28 meets it at 56.11). It also fills an anti-aliased seam on Maps' right edge, renders at 180×180 in Chromium and writes WebP to `public/icons/ios18/`. Sizes: 0.7–6.8 KB each, 23 KB in total. Licence, source and changes: `public/icons/ios18/LICENSE.txt`.
- **Switch.** `NEXT_PUBLIC_ICON_PACK`: unset or `ios18` (the default on this site) uses the pack; `original` restores the v6 gradient-and-glyph set exactly (all 18 old visual baselines pass on an `original` build). `src/lib/icon-pack.ts` holds the map. `faceProps()` sets `--face` to the image (`contain`, so the launch overlay, a tall window that starts as its middle square, shows the icon whole), and `FaceGlyph` skips the glyph. One change therefore covers the home grid, dock, folder previews, edit mode and App Library, launch overlay, App Switcher, lock-screen notification, banner and the CSS phone, and the 3D phone hosts the same DOM. The squircle mask, outer shadow, press dim, labels and spacing are untouched.
- **OG image.** It draws the pack faces. Satori's renderer can't decode WebP (the images came out blank), so the OG route re-encodes them to PNG with sharp at build time. `sharp` is now an explicit devDependency (it was already installed through Next).
- **Loading.** The layout preloads the nine images (`react-dom` `preload`), and the service worker precaches them with the other icons (the licence text is skipped).
- **Credits.** Settings → About → Credits follows the switch. With the pack on it reads "iOS 18 App Icons by David Akhmedbayev, CC BY 4.0, via Figma Community … iPhone and the app designs they depict are trademarks of Apple Inc." The README credits, the env table and `.env.example` are updated too.
- **Guide and template.** Guide v1.2 (branch `docs/guide`, 489f065) adds "Optional: an iOS 18 icon pack" with prompt 10 and a trademark warning. The originality bullets now say the template ships no system app icons and the pack is the one opt-in exception. The template still ships the original set; its `prompts/10-optional-icon-pack.md` is committed locally (87b9a30), **not pushed**.
- **Layout and contrast.** `scripts/gap-measure.mjs` (light; `docs/v7/gap-measurements-light.json`): 342 of 362 measured fields are identical to v6 (every position, size, label box, spacing, dock and widget). The 20 that differ are the tile-pixel probes (face colours and glyph extent), which change with the art. `scripts/label-contrast.mjs`: every label is at least **5.60:1** (390, 834, 1440; 4 finishes; light and dark), the same as v6.
- **Compare images** (`scripts/v7-shots.mjs`, in `docs/v7/compare/`): `390-*.jpg`, `834-*.jpg`, `1440-*.jpg` (3D phone) for Burgundy and Electric, each light original | light iOS 18 | dark original | dark iOS 18. Also `surfaces-ios18.jpg` (lock-screen notification, banner, folder preview, launch, App Switcher), `launch-ios18.jpg` (launch frames in slow motion) and `og-ios18.jpg`.
- **Visual baselines (updated on purpose).** The 6 home baselines, `home-{light,dark}-{desktop,tablet,phone}`, were forced with `--update-snapshots=all`: desktop and tablet were within the 2% threshold and would otherwise have kept the old icons. Courses and settings still match.
- **Tests.** `tests/icon-pack.spec.ts` (new) runs against whichever pack the server was built with (set the same `NEXT_PUBLIC_ICON_PACK` for `playwright test`). It checks tile faces vs glyphs, brand tiles, that each image is 180 px, the Credits wording and the OG route. On the `original` build, the new spec plus smoke and visual tests all pass (48 passed, 3 skipped). On the `ios18` build: lint, typecheck, content check and build pass. Tests: **261 passed** (249 + 12 new), 280 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks. Alone on one worker they measure 57–65 ms, the same as the last pass. Production is serving the ios18 build on :3100.

### v7 follow-up: Tips for Expertise

- **Icon.** Tips (the lightbulb) was exported from the same Figma file in the same way: your logged-in session in Chrome, a temporary frame removed afterwards, no login step. It is pure vector. `scripts/ios18-icons.mjs` turned it into `public/icons/ios18/tips.webp` (1.5 KB; the pack is 24.5 KB total), and `src/lib/icon-pack.ts` maps `expertise: "tips"`. All ten own apps now use the pack; only the brand tiles keep their own marks.
- **Wording.** The Settings credits no longer say Expertise's icon is original. The README says ten apps, and `LICENSE.txt` lists tips among ten files.
- **Visual baselines (updated on purpose).** The 6 home baselines, `home-{light,dark}-{desktop,tablet,phone}` (`--update-snapshots=all`). Courses and settings still match.
- **Tests.** Lint, typecheck, content check and build pass. Tests: **261 passed**, 280 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks, 57–59 ms alone on one worker (unchanged). Production serves this build on :3100.

## GitHub heatmap: never a blank card (branch `fix/github-heatmap`)

- **Measured first** (`scripts/heatmap-measure.mjs`: production build, 20 loads per view, 1440×900 3D phone light and dark, 390×844; per-frame sampling from the swipe to page 2). The old build: on **every load** the card was a white tile with every square at opacity 0 (median 199 ms), then fading (283 ms). First square readable p50 **498 / 495 / 497 ms** (max 520 / 514 / 528). The widget mounted 178 / 184 / 131 ms after navigation start: it waited on the page's server data, which included the GitHub fetch. GitHub itself: cold **798 ms** (3.6 s on one trial run), warm 29–68 ms.
- **Root cause.** The squares were `opacity: 0` by default and only faded in when an IntersectionObserver (threshold 0.6) reported page 2 in view. Inside the 3D phone the screen is moved into a CSS 3D transform, and the browser's visibility test misjudges it. With the phone tilted, the mouse moving during the swipe, or page 2 chosen while the phone was flipped, the observer never fired. Every square stayed invisible (and the card plain white) for over 3 s, or until something else nudged the observer. The fade itself was what hid the data.
- **Fix: the trigger.** Squares are visible by default; nothing in CSS hides them. The column fade is an animation with `backwards` fill, so it only covers the 800 ms while it plays. It starts from the pager's own position (`homePagerX`, the same value the pages' offscreen logic reads): at mount if the page is already on screen, otherwise in the pager's change handler, before that frame paints. After 800 ms `data-faded` drops the animation, so moving the screen into or out of the 3D phone can't replay it. If JS or the trigger fails, the squares are simply there. Reduced motion skips the fade.
- **Fix: the data.** `/api/contributions` is a static route with ISR (`○`, revalidate 6 h, expire 1 week; `cache-control: s-maxage=21600, stale-while-revalidate=583200`), so visitors never wait on GitHub. `getContributions()` uses GraphQL when `GITHUB_TOKEN` is set, otherwise the public contributions page. If both fail it returns the committed snapshot (`public/content/github-contributions.json`, 10 KB, 235 days to 2026-10-28, refreshed by `npx tsx scripts/github-snapshot.mts`), never nothing. On the client, if the route fails the widget loads the snapshot file directly. The home page no longer fetches GitHub at all, so the server HTML carries the widget at once. The service worker serves the route stale-while-revalidate, like the feed.
- **Fix: first paint.** The widget is server-rendered with a skeleton of the real grid: every square of all 34 weeks (17 showing in portrait) in the empty-level grey. When the data lands, the same squares (same keys, same grid positions) recolour with a 320 ms colour transition, so the layout doesn't shift (the test checks the grid's box before and after). The look, the accessible label, the tap-to-open and today's pulse are kept. Today only pulses on live data, because the snapshot's last day isn't today.
- **After** (same script, 20 loads each): first square readable p50 **396 / 397 / 412 ms** (max 406 / 409 / 429), which is the swipe's own page slide; the squares are there before page 2 arrives. Widget mounted p50 **27–28 ms** (was 131–184). Before readable, the card shows full squares that aren't hit-testable yet because page 2 is still sliding in (~65 ms), then 1–2 frames of the fade's first column (26–33 ms), then the fade (283 ms). It never shows a white tile. The old failure cases (tilted phone, mouse moving through the swipe, page 2 while flipped) all have every square opaque and hit-testable by 300 ms. GitHub fetch this run: cold 616 ms, warm 27–36 ms, now only paid by the 6-hourly revalidation.
- **Slow or failing data.** With the response held for 3 s the skeleton shows and is fully hit-testable; the colours arrive later in place. With the route failing, the snapshot shows (with its total in the label, no pulse).
- **Tests** (`tests/github.spec.ts`, service worker blocked). Desktop, 3D phone: Fast 4G throttling, `/api/contributions` held ≥ 3 s, phone tilted by the mouse, then swipe to page 2. Timed in the page from the click: the full grid within **500 ms**, every square fully opaque and hit-testable within **1 s**. Then the data lands with no layout shift, and every square stays visible after more mouse moves and after a flip and back. Phone: the route aborted → `data-source="snapshot"`, the snapshot's squares and total, no pulse, all squares visible. Lint, typecheck, content check and build pass. Tests: **263 passed** (261 + 2 new), 284 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks, 57–61 ms alone on one worker (unchanged). Production serves this build on :3100.

## v8: two Android apps in Projects (branch `feat/v8-more-projects`)

- **Sources.** StackUp: the public repo `chetanpujari5105/stackup-android-app-`, cloned and read (`pubspec.yaml`, all of `lib/`, `assets/`), plus your own notes (`Second_Brain/Projects/StackUp/StackUp-App-Complete-Data.md`, 2026-05-05) for its release status. Anti-Doom: its private repo, cloned to a temporary folder with git's saved credentials (no prompt, no login step), README and code read. Nothing from either repo was copied into this one apart from StackUp's own logo, drawn on its cover. Not the keystore, `google-services.json` or any key.
- **Anti-Doom differs from the brief.** The brief calls the app "Scroll Detox" with an Electric Violet / Neon Cyan theme. Those match the README, but the latest commit (2026-06-07, "rename app to Anti Doom and add mascot UI") renamed it **Anti Doom** (`app_name`) and moved it to a warm espresso-and-amber theme with a pink brain mascot. The site follows the code: the name is "Anti-Doom", and the cover uses the real app's colours.
- **Anti-Doom copy (checked against the code).** It counts swipes in Reels, Shorts, TikTok, Facebook Reels and Snapchat Spotlight (`AppSignatureConfig.kt`). Once you pass your daily limit it shows an unskippable breathing overlay with your own goal text (`DetoxAccessibilityService.kt`; the pause is 10 s by default, and 5–30 s can be set). The dashboard's brain mascot reflects the day's count. The manifest has no INTERNET permission, so "fully offline" holds. Left out on purpose: the "Scroll Battles" social screen (its leaderboard is hard-coded sample buddies, not a working feature), plus the PIN lock, floating bubble and quiet hours, to keep the description short.
- **StackUp copy (from the code).** A supplement and wellness tracker (pubspec: "A premium supplement and wellness tracker app"). Supplements are added by barcode (`mobile_scanner`, looked up on Open Food Facts then UPCitemdb) or by hand. It has dose reminders and missed-dose alerts, streaks with milestone confetti, a water tracker, five ready-made stacks, warnings for known clashes (e.g. zinc + iron), refill and monthly-spend alerts, a PDF report, Google sign-in, Firestore sync and Hive local storage. The tagline on the cover, "Track it. Stack it. Crush it.", is one of the app's own quotes. **Status** "Closed alpha on Google Play" comes from your notes, not the repo (the repo is the April upload, version 1.0.0+1).
- **Schema.** `ProjectSchema.url` is now nullable (null means nothing public to open, which is how Platforms already handles Packt), and an optional `status` line shows under the tagline. Anti-Doom has `url: null` with a `✏️ EDIT` comment for the Play Store link. Its detail view shows no Open button and no host, and nothing on the site links the private repo (tested). StackUp opens its public repo. Ask Chetan's link allowlist and the SEO summary skip null URLs.
- **Images** (`scripts/project-covers.mjs`, 960 × 600 WebP like every other card). Anti-Doom: two real screenshots from your phone (Vision and dashboard; `~/Desktop/scrrenshots app updlod antidoom/Screenshot_20260608_154150.png` and `…154124.png`, status and tab bars trimmed) on the app's espresso radial gradient: 31 KB. They show only the app's own UI, no one else's images. StackUp: no screenshots exist, and the app's screens sit behind Google sign-in (a web build stops at `Firebase.initializeApp()` with no web config), so the cover is its own logo and palette (#0F1117, #00C97F): 20 KB. Blur placeholders regenerated.
- **Everywhere projects are used.** The Projects app (list, filter chips, detail), Spotlight search, the SEO summary and Ask Chetan's knowledge all read `content/projects.ts`, so both apps appear in each. The OG image, the home widgets and the sitemap (one URL) don't list projects, and neither does the template guide, so none of them changed.
- **Fit.** On the 3D phone a project row leaves 156 px for its text, so the taglines are "Quit doom-scrolling" and "Supplement tracker", which fit at 390, 834 and 1440. Three existing taglines were already cut off with an ellipsis: SlapDash and Backrooms at every size, and Sidekick and Strikepoint's name on the 3D phone. They are unchanged.
- **Tests.** `tests/projects.spec.ts` (new, all three sizes): both rows show and fit with no ellipsis; Apps keeps them and Games hides them; Anti-Doom shows its status with no link; StackUp's Open goes to its repo; the private repo URL appears nowhere in the page source. Visual baselines added on purpose: `projects`, `projectsantidoom` and `projectsstackup`, each light and dark at phone, tablet and desktop (18). The home baselines still match unchanged, because no home widget shows projects. Lint, typecheck, content check and build pass. Tests: **293 passed** (263 + 12 + 18 new), 284 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks, 57–59 ms alone on one worker (unchanged). Production serves this build on :3100.

## v9: Expertise as a Smart Stack (branch `feat/expertise-stack`)

**Toolbox:** Context7 (use-gesture options and state; Motion's motion values, spring `velocity`, `stop()`), the emil-design-eng, animate and impeccable skills (impeccable's detector flags only the existing widget-press overshoot curve, untouched), Playwright.

- **The widget** (`src/components/os/ExpertiseStack.tsx`, page 2) shows one of the eight areas at a time: emoji, title, "+7 more areas" and the counter pill, with the next two cards peeking above it as before. Two blank cards sit after the last one, so card 8 still has a stack behind it.
- **One value drives it.** `pos` (a motion value in cards) is turned into each card's `transform`, `opacity` and z-order, written straight onto the elements. Drag, spring, wheel, keys and autoplay all move that one value, so any of them can grab the stack mid-flight. Ahead of the front card, a card's depth sets its lift, scale and opacity, and its words fade in over the last stretch. A card on its way out goes up the full height of the tile, 1:1 with the finger. Nothing renders blank: the first frame's styles are inline, and there's no IntersectionObserver or `content-visibility`.
- **Drag:** use-gesture with `axis: "lock"` and a 10 px threshold. Swipe up = next. On release it springs (`smooth`, with the release velocity in cards/s) to the projected card. That card is at most one past the nearest (so a flick can skip at most one card), and a flick over 0.5 px/ms always carries on to the next card in its direction. Past card 1 or 8 the whole stack rubber-bands (`rubberClamp`, half a card). A tap under 10 px still opens Expertise, at the card on top (`#expertise/<id>`, the area's sheet). After a drag, the click it ends with is ignored, and the press scale-down is cancelled (`data-stack-drag`).
- **Wheel / trackpad:** one card per gesture (24 px to trigger, then locked until the wheel is quiet for 180 ms, which covers trackpad momentum). Vertical wheels are the stack's (`preventDefault` + `stopPropagation`), so Search never pulls down. Sideways wheels still page.
- **Keys:** ↓/↑ step when the widget has focus. At either end the arrow carries on to the home grid's own arrow navigation, so focus is never trapped. Enter and Space open Expertise at the card shown.
- **Gesture conflicts:** the widget is `touch-action: none` (the layer already was). The home pager now cancels a drag that starts on `[data-no-pull]` when it locks to the vertical axis, so it can't pull down Search; sideways it still pages. The 3D phone never turns from inside the screen (`NO_SPIN`), and the tests check `data-dragging` and the screen's box. Long-press still enters edit mode. In edit mode the stack's drag, wheel and keys are off, and the editor owns the widget.
- **Bug fix on the way (it was on main too):** use-gesture turns arrow keys on a focused target into a 10 px "drag". On the home layer, that flagged the next click as a drag's, so after any arrow key on the home screen **the next Enter did nothing** (reproduced on main). The pager's `useDrag` now has `pointer.keys: false` (home-keys already handles arrows), and so does the stack's. Covered by a test.
- **Counter and a11y:** the number rolls up or down (200 ms, `@starting-style`, opacity only under reduced motion). The button's name is "Expertise, 3 of 8: Video Editing & Production". A polite live region announces where the visitor's own swipes, wheel and keys land; autoplay never announces.
- **Reduced motion** (OS or Settings): no stack motion. The front card crossfades into the next (200 ms), and a swipe of 20% of a card or a flick steps one card.
- **Autoplay:** every 6 s of being in view, untouched. It counts only while the widget's page is the current one, the pager is still, no app, Search, Control Center or switcher is open, the tab is visible, and the widget is in the viewport (bounding box, not an observer). Hover and focus pause it, and reduced motion turns it off. It stops for good at the first touch, wheel or key, and stops at card 8.
- **YouTube is now @ImaginaryProgrammer** (separate commit). The channel links, the handle and the latest-video feed (`UCZHE1x_Qh-8YfgQm44F9KQg`, which has public videos) all moved, so the page-2 widget now shows the latest video.
- **Production:** main (v8) runs on :3100 from its own worktree, `../nfc-portfolio-prod`, so branch builds and tests no longer touch it (they use `PORT=3200`). To redeploy: `cd ../nfc-portfolio-prod && git checkout --detach main && npm run build`, then restart `next start -p 3100`.
- **Tests:** `tests/expertise-stack.spec.ts` (new) runs on desktop (3D phone), tablet and phone. In light and dark: swipe up through 1/8 → 8/8 and back down; rubber-band at both ends; wheel (one card per burst) and arrow keys; tap and Enter open Expertise at the shown area; a vertical drag stays in the stack (page unchanged, no Search, no turn, no scroll). Once each: a fast flick moves at most two cards, a sideways swipe still pages, long-press still enters edit mode, reduced motion crossfades, autoplay advances after ~6 s and stops at the first touch, a real CDP touch swipe on the phone, and Enter after an arrow key on the home screen. Baselines: the home ones were regenerated on purpose, and `home2` (page 2 with the stack) was added in light and dark at all three sizes, with the clock, heatmap, video and post masked. Lint, typecheck, content check and build pass. Full run: **342 passed**, 286 skipped by viewport, 5 failed: the same throttled "window moving ≤ 50 ms" checks. Alone on one worker they measure 58–64 ms here and 58–65 ms on main, so they are unchanged.

## Contact email fix (branch `fix/contact-email`)

**Why sends failed.** The Vercel project `nfcportfolio` has **no environment variables at all** (checked with `vercel env ls`, names only). So the live route had no `RESEND_API_KEY` and answered every valid message with `503 {"reason":"unavailable"}`, and the form said "The form isn't available right now". Reproduced locally:

| Case | Before | Now |
|---|---|---|
| No key, valid message | 503 `unavailable` | 503 `unavailable`; log: `[contact] RESEND_API_KEY is not set …`; form: "Email isn't set up on this site yet" + a pre-filled "email me directly" link |
| Dummy key | Resend `401 {"message":"API key is invalid"}`; route answered **502 `failed`**, form showed the same "isn't available" banner, log only `Error: Resend 401` | 503 `unavailable`; log: `Resend refused the email (401 validation_error: API key is invalid). Check RESEND_API_KEY …` |
| Test sender to someone else | (untested) | Resend 403 → 503 `unavailable`; log explains onboarding@resend.dev only delivers to the account owner and to verify a domain |
| Invalid fields | 400 `invalid` + field errors | same |
| Bad JSON | 400 | same; bodies over 20 KB → 413 |
| Honeypot filled | 200, nothing sent | same (the field now has `name="company"` so form-filling bots find it) |
| 4th message in an hour | 429 (counted every attempt, even failed ones and while unconfigured) | 429 + `Retry-After` and `retryAfter`; 3 **sent** per hour + 5 attempts per 10 min per IP |
| Resend down / timeout | 502 `failed` | 502 `failed`; the form offers **Try again** |
| Post from another site | accepted | 403 `forbidden` (Origin must match Host) |

CORS wasn't involved: the form posts same-origin.

- **Sending** (`src/app/api/contact/route.ts`): From `CONTACT_FROM_EMAIL` (format-checked; never the visitor), defaulting to `Pocket Portfolio <onboarding@resend.dev>` with a one-time warning. To `CONTACT_TO_EMAIL`, or `profile.email` by default. `reply_to` is the visitor. The subject is `[chetanpujari.com] <their subject> (from <their name>)`. Text and HTML bodies carry name, email, subject and message. Control characters are stripped, line breaks are removed from name and subject, and the HTML is escaped. `RESEND_API_URL` (default `https://api.resend.com`) exists only so tests can point at a fake.
- **Form** (`src/components/apps/contact.tsx`): Send shows a spinner (`aria-busy`) with a "Sending…" note. Success shows "**Message sent.** I usually respond within 24 hours." and the status pill shows "Message sent". Failures keep every field and show what happened, in an alert: not set up (with a mailto link carrying their subject and message), too many requests ("Try again in 9 minutes"), couldn't send, couldn't reach the server, or offline. All except not-set-up have **Try again**. A ref blocks double submits (two clicks in one task, or Send then Enter). The old toast is gone; the note replaces it.
- **Tests:** `tests/contact.spec.ts`. The UI tests (all three sizes) mock `/api/contact`: valid send with spinner, note and pill; client and server validation; missing key fallback keeps the text; a network failure keeps the text and Try again sends; 429; 502; double submit sends once. The API tests (desktop) start the built app three times with different env, against a fake Resend in the test process. They cover From/To/Reply-To/subject/escaping, the test-sender fallback and its log line, no key (Resend untouched, log names the setting), Resend 403/401/500 mapping, validation, honeypot, cross-origin, and both rate limits. Resend is never called. `smoke.spec`'s contact check now expects the alert and the kept text. Full run: **381 passed**, 310 skipped, 5 failed: the usual throttled speed checks, 57–64 ms here against 57–63 ms on main, alone on one worker.
- **Docs:** README has a "Contact form email (Resend)" section with the steps, and `.env.example` explains each variable, including that the test sender only reaches the Resend account owner.

## Overnight run (2026-10-29)

Full report: `docs/morning-report.md`.

- Prod :3100 (from `nfc-portfolio-prod`), `main` and `origin/main` all at 8cdd6a7. Vercel production `dpl_ATHHXT8gtXWEmDrsyTQzdMLpev86` is Ready and serves 8cdd6a7.
- Live checks at 390x844 and 1440x900, light and dark: home pages 1 and 2 paint, heatmap shows in under 100 ms, the Expertise stack swipes, Projects shows Anti-Doom and StackUp. Contact answers 503 `unavailable` until `RESEND_API_KEY` is set (the form explains and keeps the text). Screenshots in `docs/morning/` (gitignored).
- Blocked at a login: Resend (not signed in) and the GitHub token ("Confirm access" passkey). Nothing created, no Vercel settings changed.
- Hygiene: gitleaks found no leaks in 45 commits; no env files, keystores or `google-services.json` tracked; the private Anti-Doom repo URL isn't on the live site.
- Deleted 10 merged local branches (none on GitHub).

Second pass (morning): still blocked. Resend shows its login page in the Chrome Claude controls (Vercel and GitHub are signed in there), and GitHub token creation asks for the passkey again. No keys, no Vercel env changes, no redeploy needed. Live checks at all 4 sizes: no regressions; `/api/contributions` source is `github`. YouTube's channel RSS returns 404 for every channel right now, so the YouTube widget shows the channel card until it's back. Details and a 5-minute finish list in `docs/morning-report.md` → "Second pass".

Third pass: done. Resend key + `CONTACT_TO_EMAIL` (Resend account, test sender) + `GITHUB_TOKEN` in Vercel Production and prod `.env.local`; one redeploy (`dpl_ARyDWoqt1gRSt8DrCyoav2BL6uBV`); one live test message Delivered; `/api/contributions` source `github` (1,016). No domain in Resend yet. See `docs/morning-report.md` → "Third pass".

Gmail switch (branch `fix/contact-gmail`, d0673ba, merged and pushed): Contact sends through Gmail SMTP with Nodemailer; Resend only as a fallback. API tests use a fake SMTP server (`smtp-server`). Full suite: 383 passed / 5 known speed fails / 314 skipped. Production `dpl_5vxKcmzXMLfzedqfhbxRXczjrQhJ` Ready; a live test arrived in the Inbox; :3100 rebuilt from `nfc-portfolio-prod` on d0673ba.

## v10: iOS lock screen + Apple-style Journey (branch `feat/v10-lockscreen-journey`, merged to `main` 5cb239c)

References: the tall-clock lock screen with round widgets and flashlight/camera buttons, and the iOS 26 glass-metal clock (local copies in `docs/reference/v10`, gitignored).

- **Lock screen (8e33c7f).** Clock: Archivo at `wdth 62`, weight 330, stretched `scaleY(1.8)` with a transform (glyphs keep their baseline; `text-box: trim` holds the box), `min(50cqw, 27.5cqh)`, so ~28.5% of the screen at 390x844, 834x1112 and on the 3D phone, and the widest time ("10:08") stays inside. 12-hour like iOS, date "Thu, Oct 29" above, live. Glass: top-to-bottom white gradient, a lit hairline edge on the top of each glyph, a soft drop shadow, a sheen and a few px of parallax that follow the tilt (3D rig → `phoneTilt`; the CSS phone uses the pointer, Android uses device orientation). Round widgets: battery (where the browser shares it), GitHub this week (ring = active days of 7, centre = contributions), Pune analog clock. Flashlight toggles a soft-light brightness boost (off on unlock); camera opens Contact from the button. Substack notifications: iOS platter (light/dark glass, 22 px radius), simple-icons Substack mark on its orange squircle, small-caps app name, bold title, secondary line, "now"; up to 3 stacked, a tap spreads them, a tap on a card opens that post in Blog. Swipe up follows the finger with the clock scaling/fading and rubber-band; the wallpaper blurs mid-unlock and clears under the home screen; a scroll/wheel also unlocks on desktop. **A tap now wakes it** (the sheet lifts and drops back, the chevron starts); a second tap, Enter or the hint opens. Status bar drops its time on the lock screen. The post-unlock banner uses the same platter and mark (no Notes icon anywhere).
- **Depth effect skipped:** the wallpaper is a WebGL shader, so a "ribbon in front of the clock" needs a second masked render of the shader every frame. Not clean or cheap enough; skipped as allowed.
- **Journey (4739813).** Large collapsing title, inset-grouped sections 12 px apart, 16 px insets, 17/600 titles, 15 grey secondary, 13 captions, all in rem (Larger text scales it). Profile card, "My Story" row (pushes the full story), "Roots to leaves": each year a section header with a node on one hairline rail that runs through the milestone tiles; Education; Highlight. Original SF-style glyphs on flat system-colour squircles, no emoji (the story's ☕ is stripped when shown; content files unchanged). Milestones are split only at their semicolon. Rows push a detail (`#journey/2025` shows that year's highlight; `#journey/2020` its story paragraph), with the edge-swipe back from PushView.
- **YouTube (5cb239c).** `lib/youtube.ts`: live feed, else the committed `public/content/youtube-latest.json` (refreshed before each Vercel build and by `npx tsx scripts/youtube-snapshot.mts`). The widget never drops to the channel card on a 404 again.
- **Tests:** new `lock.spec` cases (wake then open, flashlight, camera → Contact, notification stack, clock size/fit at "10:08", wheel unlock), `journey.spec` (facts word for word, no emoji, push + swipe back, type scale + Larger text), `youtube.spec` (404/empty/offline keep the snapshot). New visual baselines: lock light/dark, `#journey`, `#journey/2025` on all three projects. `fit.spec`'s switcher check skips the cards' inert previews (Journey's preview has rows below the card edge). Full suite: 423 passed, 5 failed = the known throttled speed checks (58–62 ms vs 50), 319 skipped.
- **Screens:** before/after sheets `docs/v10/lock-{390,834,1440}.jpg`, `docs/v10/journey-{390,1440}.jpg`, `docs/v10/journey-detail-{390,1440}.jpg`. With the references side by side: `docs/v10/after/compare/lock-*.jpg` (gitignored). Regenerate: `node scripts/v10-shots.mjs <dir> [base] [--refs a,b]` then `node scripts/v10-sheets.mjs`.
- **Live checks** (`node scripts/live-check.mjs [base] [outDir] [--send]`): 56/56 on nfcportfolio-two.vercel.app at 390x844 and 1440x900, light and dark; one real Contact message sent (API 200) and found in the chetanpujari92@gmail.com Inbox.
- **Google app password "NFCPortfolio":** not deleted. myaccount.google.com/apppasswords went straight to a passkey challenge, so I stopped (see Needs Chetan).

## v10 follow-up: iOS 27 tokens and the shell consistency pass (branch `feat/v10-ios-tokens`, merged to `main` 586642b)

- **Tokens (53d2605).** Read from the iOS 27 Builder kit by Luch Dev (Figma `7fp30JpDD6R8MRCEf9GysN`) through the page's plugin API, in ~1 KB pieces (no network receiver, no clipboard). The kit's colours (light/dark), Dynamic Type ramp, spacing, radii and component metrics are in `src/lib/ios-tokens.ts`. The same values are `--ios-*` variables in `globals.css`, with `bg-ios-*`, `text-ios-*` and `rounded-ios-*` utilities, and one `.dark` switch. The app roles (`--app-background`, `--app-group`, `--app-ink`, `--app-divider`) point at them. Secondary text stays opaque for 4.5:1, a deliberate departure from the kit's 60% label. `docs/ios27-spec.md` lists what was read, with node ids. Apple's iOS and iPadOS 27 file (`ClYfkhyEVp6YXhlyWleSNA`) was opened read-only for numbers only. No licence prompt appeared, and nothing was exported or copied. The type ramp, accents and backgrounds match. Separators, grabber width and two fills differ, and Luch Dev is used for those. `tests/tokens.spec.ts` checks that the map and the CSS agree in both modes.
- **Shell (6431747).**
  - Bar: 44 pt glass back buttons; the bar title is Headline; the bar uses the kit's hard scroll edge.
  - Lists and headers: the kit Large Title and Subheadline subtitle. Section headers are the kit's Nested header (Headline, grey, no caps). Grouped sections have radius 26 with opaque separators #E7E7E8 / #2A2A2C. Rows are 52 / 68 pt with a Body title and Subheadline detail, and a chevron only when the row navigates.
  - Controls: the toggle is 64x28 with a capsule knob and Accents/Green. The segmented control is a grey capsule with a white pill.
  - Sheets and alerts: sheets have radius 38 and a 58x4 grabber. The Home Screen alerts (Remove, Reset) are one radius-34 card with 48 pt capsule buttons, none filled; the destructive one is red. Spotlight search is a 48 pt capsule.
  - Apps: Blog, Contact, Courses, Services, Reviews, Projects, Settings and Journey now use these tokens instead of their own sizes and blues. Journey's year headers are the kit's Nested header (17 px), and its tiles use the kit accents.
- **Credits (586642b and Settings).** "iOS 27 Builder by Luch Dev (Figma Community; © 2026 Luch Dev, all rights reserved), values only", plus "iPhone, iOS and iPadOS are trademarks of Apple Inc." Apple's file is not credited as a source.
- **Screens:** before/after per app in `docs/v10/shell-sheets/<app>.jpg`. In each sheet the top row is before and the bottom row is after; columns are 390 light, 390 dark, 1440 (3D phone) light, 1440 dark. Regenerate with `node scripts/shell-shots.mjs <dir> [base] --sheets <beforeDir>`.
- **Tests:**
  - Lint and typecheck are clean; the build passes.
  - Full suite on the branch build: every test passes except two groups. The first is the 5 known throttled speed checks. The second is the visual baselines the redesign changed (courses, settings, projects, Journey), which were updated on purpose; a re-run of `visual.spec` gives 60/60.
  - `journey.spec` now expects 17 px year headers. `tokens.spec`, `journey.spec` and `home-edit.spec` pass.
- **Deploy and live checks:** Vercel Production `nfcportfolio-l1nniwpi0` is Ready, and :3100 was rebuilt at 586642b. `node scripts/live-check.mjs` passes 56/56 on nfcportfolio-two.vercel.app (390x844 and 1440x900, light and dark). No second contact message was sent; the earlier one had already arrived.
- **Google app password "NFCPortfolio":** tried again. myaccount.google.com/apppasswords went straight to the passkey challenge, so I stopped and closed the tab.

## Needs Chetan

- [ ] **Delete the Google app password "NFCPortfolio"** (keep "portfolio", which the contact form uses): myaccount.google.com/apppasswords asked for your passkey twice (v10 run and the follow-up), so I stopped there both times. Open it, pass the passkey, and press the bin icon next to "NFCPortfolio" only.
- [ ] **v10 on a real phone:** the lock clock's size and glass, the swipe-up feel and wallpaper blur, the tap that wakes, flashlight and camera buttons, the notification stack; Journey's rail, push and edge-swipe back, and with Larger text on. Say if a tap should open straight away instead of waking first.
- [ ] **iOS 27 Builder licence:** the kit says "© 2026. All Rights Reserved. — Luch Dev" (Figma Community file; its agent skills are Apache 2.0). The site takes only values from it (sizes, colours), credited in Settings and the README. Confirm you are happy with that reading, or ask Luch Dev.
- [ ] **Shell pass on a real phone:** the 44 pt glass back button, 17 px grey section headers (no caps), the rounder radius-26 groups, the wider 64x28 toggle and the Home Screen alerts. See `docs/v10/shell-sheets/`.
- [ ] **Apple-style icon pack:** still on (see "iOS 18 icons: trademark call" below). `NEXT_PUBLIC_ICON_PACK=original` in Vercel, then redeploy, is the safe fallback.

- [ ] **Real-device check of v5:** iPhone Safari, Android Chrome, Brave, Samsung Internet, and the LinkedIn and Instagram in-app browsers.
  - Home fits with the toolbars shown, in landscape, and in Contact with the keyboard up.
  - Launch feel: does the window start growing on the tap itself?
  - A repeat visit loads instantly, including in airplane mode after one visit.

- [ ] **Apple's iOS 26 kit licence:** the Apple file (`2cdxEjNphFl72aUphywVus`) says using it means agreeing to the licence in the library (© 2026 Apple Inc.). I accepted nothing and took only published measurements for the notification stack (card size, radius, stack insets). Say if you'd rather I drop those and use the community kits' numbers only. Details in `docs/ios27-spec.md`.
- [ ] **Lock-screen reel:** the Instagram notification is the newest reel as of 2026-10-29, caption copied word for word without emoji, no thumbnail (Instagram's image links expire). When you post a new reel, update `content/lock-notes.ts` (url, the first lines of the caption, the time).
- [ ] **Control Center on a real phone:** pull down from the top right, the slider feel (brightness, text size), Flashlight (it brightens the screen; there's no torch on the web), the Finish and Wallpaper menus, and swipe-up to close.
- [ ] **Reviews were copied from Udemy; remove any you don't want public.** 16 real 5-star reviews in `content/reviews.ts` (the five old unverified placeholders are gone; they're in git history). Left out on purpose: reviews from accounts named "Chetan", "Genstruct Sapna", "Shaila", "Shaila P" and anyone surnamed Pujari, in case they're people close to you. Say if any of those should go in.
- [ ] **Prompt Chaining post URL:** not found in the Substack feed/sitemap; the fallback post links to the publication home. Put the real URL in `content/blog.ts` if it exists.
- [x] **Contact email:** since 2026-10-29 (d0673ba) the form sends through Gmail SMTP: `GMAIL_USER`/`GMAIL_APP_PASSWORD` (app password `portfolio`) and `CONTACT_TO_EMAIL=chetanpujari92@gmail.com` in Vercel Production and `nfc-portfolio-prod/.env.local`. A live test arrived in the chetanpujari92@gmail.com Inbox. No domain needed. `RESEND_API_KEY` is still set but unused while the Gmail variables exist. If you revoke the app password, the form falls back to "email me directly" and the log says `Check GMAIL_USER / GMAIL_APP_PASSWORD`.
- [ ] **Ask Chetan (optional):** set `OPENAI_API_KEY` (server only) and `NEXT_PUBLIC_ENABLE_ASK=true` in Vercel, then redeploy. `OPENAI_MODEL` defaults to `gpt-5-mini`. Try a few questions before announcing it.
- [x] **YouTube widget:** @ImaginaryProgrammer's latest video. Since v10 a feed failure (404) keeps the last good video from `public/content/youtube-latest.json` instead of the channel card.
- [ ] **Expertise stack on a real phone:** check the swipe feel (spring, rubber-band), that a vertical swipe on it never scrolls or pulls down Search in iOS Safari, and that a sideways swipe still pages. Say if you'd rather autoplay wrap from 8 back to 1, or not run at all.
- [ ] **Home-screen editing on a real phone:** on touch a long-press goes straight into edit mode (as on iOS when you keep holding); the Open/Share/Remove menu is right-click, Shift+F10 or the menu key. Say if you'd rather have the menu on touch too. Check the haptic tick on Android (iOS Safari has no vibration API).
- [ ] **Domain:** point `chetanpujari.com` at the Vercel project (or set `NEXT_PUBLIC_SITE_URL`) so the canonical URL, sitemap and OG links match the live site.
- [ ] **GitHub username:** the heatmap uses `chetanpujari5105`, found in the remotes of your other local repos. If that's wrong, change `github` (and the GitHub social) in `content/profile.ts`.
- [x] **GitHub token:** `portfolio-heatmap` (public repos read-only, no permissions) is `GITHUB_TOKEN` in Vercel Production and `nfc-portfolio-prod/.env.local`. It expires 29 Oct 2027, so renew it before then. If GraphQL and the public page both fail, visitors see the committed snapshot: refresh it now and then with `npx tsx scripts/github-snapshot.mts` and commit `public/content/github-contributions.json`.
- [ ] **3D model licence:** the iPhone 18 Pro Max model came with no licence file; its export says "Binkies MDM". Find where it came from and confirm the licence allows use on a public site, then put the terms in `public/models/LICENSE-iphone-18-pro-max.txt`. Until then the back shows the ⚡ CP mark. Set `NEXT_PUBLIC_SHOW_MODEL_LOGO=true` only if the licence (and Apple's trademark rules) allow showing the manufacturer logo.
- [ ] **iOS 18 icons: trademark call.** The Figma file is CC BY 4.0, but that only covers the author's work. The app designs it depicts are Apple's, and the file's own "Disclosure" asks you to use the icons "according to the guidance of the owner of the icon". Apple's trademark guidelines are strict about using its icons and images. Decide whether to keep the pack on the public site. `NEXT_PUBLIC_ICON_PACK=original` in Vercel (then redeploy) switches every tile back.
- [x] **Expertise icon:** done. It uses Tips from the pack (v7 follow-up).
- [x] **Push guide v1.2 and template prompt 10:** pushed (`origin/docs/guide` 489f065, template `main` 87b9a30).
- [ ] **Icon review (`original` set):** the fallback set is unchanged from v6 (flat white glyph on a 2-stop gradient). See `docs/v6/gap-after/sheets/icons-light.jpg`.
- [ ] **Your saved home layout:** a browser that already saved a home layout (`pp-home-v2`, e.g. your own Chrome) keeps it, so it won't show the v10 default (AI Instagram and Services on page 1, Settings on the dock, GitHub in Socials). Use Settings → Reset Home Screen to get it.
- [ ] **Packt profile URL:** the old site's Packt links were `#`; Packt shows without a link in `content/platforms.ts`.
- [ ] **Anti-Doom Play Store link:** if it's live (or has a public APK), put the link in `url` for `anti-doom` in `content/projects.ts` (marked ✏️ EDIT). Until then the card has no Open button.
- [ ] **Anti-Doom name and status:** the brief said "Scroll Detox", but the latest code says "Anti Doom", so the site uses Anti-Doom. Confirm the name, and replace "Android · source is private" if it's in testing or released.
- [ ] **StackUp status:** "Closed alpha on Google Play" comes from your May notes (v1.0.0+5, 176 countries). Confirm it's still true, and whether the public repo (an April snapshot) should be the link or a Play Store listing.
- [ ] **StackUp screenshots (optional):** its cover is the logo, because the screens need Google sign-in. Send a few phone screenshots of the signed-in app if you'd like real screens instead (`scripts/project-covers.mjs`).
- [ ] **StackUp repo hygiene (FYI):** the public repo contains `android/app/google-services.json`. Firebase client config isn't a secret by itself, but check that your Firestore rules and API-key restrictions are locked down.
- [ ] **Anti-Doom repo (FYI):** the private repo has `debug.keystore.base64` committed. It's a debug key, but keep it out of any public copy.

## v10 Part A: real Udemy reviews (branch `feat/v10-lockscreen-journey`, 2026-10-29)

Reviews were read by hand in Chrome from instructor.udemy.com → Performance → Reviews (5 stars, "Has a comment"), one course at a time, oldest and newest first. Only what was on screen was copied: text verbatim, the name as Udemy shows it, Udemy's date label, the course and its URL. No crawling, no scripts against Udemy, no avatars. 16 reviews from 9 courses: UI/UX Design With Figma (3), Master Web & Mobile Design (1), Canva Masterclass (3), Filmora 11/X/9 (2), Adobe Premiere Pro CC (1), Mastering ChatGPT Prompt Engineering (2), ChatGPT Prompt Engineering Mastery (1), ChatGPT Masterclass: Navigating AI (1), Master Notion (2). Review pages (course landing pages, "Reviews" section):

- https://www.udemy.com/course/uiux-design-with-figma-5-real-world-projects2022/
- https://www.udemy.com/course/master-web-mobile-design-figma-uiux-essentials-more/
- https://www.udemy.com/course/canva-masterclass-for-social-media-and-content-creation/
- https://www.udemy.com/course/filmora9-complete-video-editing-tutorial-for-beginners-2020/
- https://www.udemy.com/course/adobe-premiere-pro-cc-video-editing-for-beginners/
- https://www.udemy.com/course/mastering-chatgpt-prompt-engineering-beginner-to-advanced/
- https://www.udemy.com/course/chatgpt-prompt-engineering-mastery/
- https://www.udemy.com/course/the-complete-guide-to-chatgpt-ai-prompts-dall-e-more/
- https://www.udemy.com/course/master-notion-build-your-all-in-one-productivity-system/

Courses checked with nothing usable (no 5-star comment of 20–60 words without emoji): Google Veo 3.1, HeyGen Video Mastery, InVideo, AI Mastery (ChatGPT + MidJourney), ChatGPT Masterclass: The Ultimate Beginner's Guide. The public profile shows 392,559 learners and 10,279 reviews but no average, so the app's "5.0" is computed from the 16 reviews shown and says so.

The Reviews app is now App Store style: large title, a summary card (average and bars from the shown reviews, plus the Udemy profile counts labelled as such), a "Most Helpful" glass carousel (follows the finger, rubber-bands, lands on the page the flick heads for, arrow keys and page dots), and "See All Reviews", which pushes an inset-grouped list with course chips; each row opens its course on Udemy. No emoji, our own star glyph, rem type. Tests: `tests/reviews.spec.ts`.

## v10 Part B: lock screen, Control Center, home (branch `feat/v10-lockscreen-journey`, 2026-10-29)

- **Clock fit (68dbefa).** The lock clock is measured against the phone screen's own box (a ResizeObserver on `[data-screen]` and the digits, plus font-load events), with 5% side margins, under the date and clear of the Dynamic Island. Wide times shrink. `tests/lock-fit.spec.ts` checks 1:11, 10:08, 12:59 and 2:15 at 360x640, 390x844, 430x932, 834x1112, the 3D phone at 1440x900, two landscapes, Larger Text, reduced motion and with fonts held back (at least 4% each side). Before/after: `docs/v10/lockfit/`.
- **Notifications (eee99bd).** Three of the site's own: the latest Substack post (opens it in Blog), the latest reel (opens Instagram in a new tab) and Sidekick (opens Projects → Sidekick). Times read now / 2m / 1h; older ones stack under the newest like iOS (tap to spread); swipe left or Delete clears one. Sizes from Apple's iOS 26 kit (see `docs/ios27-spec.md`). Shots: `docs/v10/lockfit/notes-*`.
- **Control Center (5cd1c62).** Rebuilt on the Liquid Glass Control Center kit's grid: a 2x2 cluster (Dark mode, Reduce motion, Larger text, Flashlight), Now Playing (the latest YouTube video, opens on YouTube), Finish and Wallpaper buttons that open glass menus, a Contact shortcut, and two tall pill sliders (brightness, text size). No fake radios. Drag down from the top right, swipe up, Esc or tap outside to close; light and dark; phone, landscape and the 3D phone. Shots: `docs/v10/cc/`.
- **Home (8caf631).** AI Instagram is on page 1, Services moved into the grid, and the dock is Courses, Blog, Contact, Settings. GitHub moved into Socials (it keeps its page-2 widget) so every row stays full and no link is gone. Shots: `docs/v10/home/`.
- **Release.** `main` f02bb15, Vercel Production `nfcportfolio-hwupep9c5` Ready, :3100 rebuilt. `scripts/live-check.mjs` now also checks the three notifications, the dock, Control Center, Reviews and a 360x640 lock: 75/75 live, and one real contact message sent (200).
