# v5 problem 2: speed

All numbers are from production builds on this machine. `main` (b955aab) is "before"; `feat/v5-mobile` is "after".

**Phone profile:**
- Chromium in Playwright, iPhone-sized viewport, touch.
- CPU slowed 4× through DevTools ("4× slowdown").
- Network: "Fast 4G" (60 ms latency, 9 Mbps down).
- One test at a time. Five throttled browsers running in parallel roughly double every number.

## Before → after

Launch rows are medians across Journey, Courses, Blog, Projects and Settings. Each run is a fresh load, then a two-second pause, then a tap (`tests/speed.spec.ts`).

| Moment | Target | Before (4× CPU) | After (4× CPU) | After (1× CPU) |
|---|---|---|---|---|
| Tap → window in a painted frame | ≤ 50 ms | 346–361 ms | 46–51 ms | 39–46 ms |
| Tap → window moving (2nd frame) | ≤ 50 ms | 361–384 ms | 57–62 ms | 41–50 ms |
| Tap → title and content readable | ≤ 250 ms | 370–469 ms | 101–176 ms | 60–93 ms |
| Launch settled | ≤ 380 ms | 805–877 ms | 386–425 ms | 345–398 ms |
| Close (Esc → window gone) | ≤ 300 ms | 272 ms | 277 ms | – |
| App switch (card tap → settled) | ≤ 450 ms | 2.6 s once, never settled once | 351 ms | – |
| Page swipe | 60 fps | 59 fps, worst frame 33 ms | 59 fps, worst frame 33 ms | – |
| Script requests after the tap | none | the window chunk and the app chunk | none | none |
| Initial JS (gzip) | ≤ 200 KB | 199.4 KB | 199.8 KB | |
| Lighthouse mobile performance | ≥ 92 | 91 | 93 (accessibility, best practices, SEO 100) | |
| Lighthouse desktop performance | 100 | – | 100 (all four categories 100) | |
| Repeat visit (service worker) | near-instant | full network load | `load` in ~70 ms, nothing from the network | |

Moments outside the launch test come from `node scripts/speed-moments.mjs [base] [video.webm]`.

The screen recordings of that script are [`speed/before.webm`](speed/before.webm) and [`speed/after.webm`](speed/after.webm). Both are on the 4× profile: three launches and closes, two app switches and a page swipe.

**Long tasks (over 50 ms) during interactions** (`node scripts/longtasks.mjs`):
- Desktop: none.
- iPhone 13: none.
- iPhone 13 with 4× CPU: none in most runs. Turning on dark mode in Control Center sometimes takes one 50–66 ms task (see "Still open").
- Since problem 3 the script also tours home-screen editing: a long-press into edit mode, a drag, a drop-and-hold that makes a folder, the App Library, Done. None of those steps has a long task on any profile.
  - Making a folder first cost one 60–70 ms task at 4× CPU. Two causes:
    - the wallpaper's draw loop read `clientWidth` every frame, which forced the drop's layout into its own frame. The canvas size now comes from a ResizeObserver.
    - the new folder opened in the same frame as the drop. It now opens two frames later.
  - The wallpaper also samples its top colour (`readPixels`, for the browser bar) only once input has been quiet for 1.5 s, so the sample never lands in a gesture.

## What the trace showed (before)

Source: `scripts/speed-trace.mjs` (cold load → Journey → close → Courses → close → Blog). Summaries are in `speed/trace-summary-{before,after}.json`.

1. **Every launch waited about 350 ms before the window appeared.**
   - `next/dynamic` loads a chunk only when the component first renders.
   - Its loading fallback goes through Suspense, and React holds a Suspense fallback back for about 300 ms.
   - The window and each app were behind `next/dynamic`, and the idle preload only started after 4 s. So every early tap fetched one or two chunks and then waited out the throttle.
2. **The tap itself took 30–45 ms of script** (4× CPU). Most of it was forced layouts:
   - The window measured itself after its app was already in the DOM.
   - The dock's hover magnifier called `getBoundingClientRect` on every move.
   - Motion's `layout` animation on the status pill re-measured the page in the next frame.
   - Making ~250 home elements `inert` restyled all of them.
3. **Drawing work during the launch:**
   - A `blur()` filter on the app's content, and on the home screen behind it.
   - Backdrop filters re-blurring under the moving window.
   - The wallpaper's WebGL loop still drawing at 30 fps.
4. **Images:** the avatar was fetched at 256 px for a 96 px box.

## What changed

**Code-splitting without Suspense** (`src/lib/lazy.tsx`):
- Once a chunk has arrived, the component renders in the first frame.
- Until then a skeleton shows, and the content fades in when the code lands.
- The window and the app registry are fetched straight after hydration.
- Every app chunk is fetched once the page is idle (`requestIdleCallback`, 1.5 s timeout) or on the first `pointerdown`/`touchstart`, whichever comes first.
- Motion's features load right after hydration, before a tap is possible.

**The tap's own frame:**
- **Window shell first:** the app's content renders one frame after the window starts to grow. The icon's face covers it until then.
- **Measured at the tap:** the launch origin and screen size are read while layout is still clean.
- **Dock magnifier:** caches icon positions once, when the mouse enters the dock.
- **Status pill:** grows with a CSS transition instead of a Motion `layout` animation.
- **Home screen:** becomes `inert` only after the launch lands.
- **Memoisation:** Phone's static layers and the dock are memoised, so a launch only re-renders the home layer and the window.
- **Deferred style reads:** reading the app background and the wallpaper colours waits for the next frame.

**Drawing:**
- No blur anywhere in a launch.
- Backdrop filters are off on the home screen and in the app bar while the window moves (`[data-window-moving]`).
- `will-change` is set only while the window moves.
- App content has `contain: layout paint`.
- Off-screen home pages use `content-visibility: auto`.
- The wallpaper skips frames while an app is launching or open.

**Springs:**
- Launch: stiffness 420 / damping 38. Settles in ~320 ms; content readable (40% progress) by ~70 ms.
- Close: 520 / 44, about 270 ms.
- A 0.003 rest threshold: Motion's default kept the spring ticking about 150 ms after any visible movement.
- Everything is still interruptible: a close can be reversed, and a tap during a close lands.

**Images:**
- `imageSizes` covers every thumbnail box (56, 58, 64, 72, 80, 96 px) at 1×, 2× and 3×.
- Blurred 12 px previews (`scripts/make-placeholders.mjs` → `src/lib/placeholders.ts`).
- AVIF and WebP as before.

**Fonts:**
- Only the UI face (Geist, variable, Latin, `display: swap`) is preloaded.
- Archivo (clock and name) swaps in without a preload.
- Geist Mono was never used and is gone.

**Bundle:**
- The wallpaper's WebGL renderer is its own chunk, loaded at the first idle moment while the CSS gradient shows.
- Editing-only home helpers moved to `src/lib/home-edit.ts`.
- With that, the window could leave the first bundle and initial JS stays under 200 KB.

**Service worker** (`sw/sw.ts`, built by `scripts/build-sw.mjs` into `public/sw.js` before `next build`, because Vercel's build adapter collects `public/` during the build):
- It uses Serwist's core library. `@serwist/next` doesn't build with Turbopack, and `@serwist/turbopack` is experimental.
- **Pages:** network-first, with a 3 s timeout, then the cached copy. A deploy's new HTML and chunks always win when online.
- **`/_next/static`:** cache-first. The files are hashed and immutable.
- **Images and `/api/feed`:** stale-while-revalidate. GitHub and YouTube data arrive inside the page itself.
- **Precached:** icons and the start page, revisioned by the deploy's commit. Fonts are cache-first under `/_next/static` like the chunks.
- **First visit:** the chunks fetched before the worker took control are copied into its cache from the HTTP cache.
- **Updates:** `skipWaiting` + `clientsClaim` + `cleanupOutdatedCaches`.
- **Dev:** registered in production builds only, so it never touches `next dev`.
- **Offline:** after one visit, the site reloads and opens apps with the network off.

## Still open

- **"Moving" within 50 ms on 4× CPU.** It measures 57–62 ms; without throttling, 41–50 ms passes. The work in the tap is now about 7 ms of real CPU.
  - Headless Chromium stalls 25–30 ms before the first frame after any visible state change. Opening Search does it too; a click that changes nothing doesn't.
  - Ruled out:
    - the WebGL wallpaper;
    - the window's own rendering (it stays with the window hidden);
    - `history.pushState`;
    - `document.title`;
    - the theme-color meta tag.
  - It isn't attributed in a full-category trace, so `tests/speed.spec.ts` still fails its 50 ms check on the throttled profile.
  - This needs checking on a real phone (see the Needs Chetan list in `progress.md`).
- **Dark-mode switch on 4× CPU.** The circular reveal is a view transition. Capturing the page for it re-lays out the whole document: a 35 ms layout plus the capture itself, which comes to one 50–66 ms task in some runs.
  - Switching without the transition made it worse: style, layout and paint then land in one task every time.
  - Layout containment on the home layer didn't change it.
- **4× CPU against production** (nfcportfolio-two.vercel.app, 2026-10-28). Desktop and the iPhone 13 profile had no long tasks. At 4× CPU, 2 runs each had 4–7 tasks of 51–92 ms, on launches (Courses, Settings, Projects), dark mode and two editing steps. Against the local production build the same script mostly finds none.
  - Not yet attributed. The likely difference is network timing: on the live site images and data arrive during the tour, not before it.
  - On production at 4× CPU: close 287–335 ms, app switch 341–346 ms, swipe 58 fps (worst frame 50 ms).
