# Feel gap: reference vs. Pocket Portfolio

Behaviour notes only. Nothing here is copied from the reference: no code, text, images, icons,
fonts, 3D model or wallpapers. Recordings live in `docs/feel/videos/` (gitignored) and are made with
`scripts/feel/record.mjs` (Playwright `recordVideo`, 1440×900 + iPhone 13 touch context). Timings come
from `scripts/feel/analyze.mjs`, which reads per-frame scene-change scores from the videos with
ffmpeg, so they are ±40 ms (25 fps video). Long tasks come from a `PerformanceObserver` in the page.

**Before** = `feat/pocket-portfolio` @ `6a45145`, recorded 2026-10-27. **After** = this branch, see
the last section.

| Interaction | Reference behaviour (plain words) | Mine now | Gap | Fix |
|---|---|---|---|---|
| First load / arrival | WebGL phone fades and settles in about 1.3 s; one smooth motion, no bounce. | Flat CSS frame rises 24 px with a fixed 900 ms cubic curve. 2 long tasks on load (63, 157 ms). | No 3D object; arrival is a curve, not a spring; load long tasks. | 3D phone on by default; arrival as one spring (120/20) for rise, rotation and fade; screen wakes 150 ms after landing; 3D chunk loaded at idle. |
| Mouse hover / parallax | The phone leans a few degrees toward the pointer, eased, and squares up over the screen. | Nothing moves (3D is behind a flag that is off). | No parallax. | ±6° critically damped tilt from pointer; squares up while the pointer is on the screen. |
| Drag-rotate 360° and let go | Grab cursor on the stage. Dragging spins the phone and shows its back. On release it keeps spinning with the release velocity, then turns back to the front; ~2.7 s from release to rest, no hard stop. | Not possible. | No rotation, no back of the phone. | Drag on stage (not the screen, 6 px threshold), inertia that decays, spring back to front after 1.2 s idle; settles on the back if released there; tap / double-click / `R` returns to front. |
| Open app ×3 | Window grows from the icon; ~150 ms to near full size, then a short spring tail (≈280–440 ms total). | Grows from the icon with a spring; ≈440 ms to rest. Icon art crossfades over 25–70 % of the motion. | Ours is a bit slow to "arrive"; no blur-to-sharp, home doesn't recede much. | `launch` spring (380/34); icon art crossfades in the first 40 %; content blur → sharp; wallpaper + icons scale to 0.9, dim and blur. |
| Close app ×3 (Esc) | Collapses back into its icon, ≈280 ms. | Collapses into its icon, 280–320 ms. | Close is not interactive by gesture beyond a small pull; can't be interrupted mid-flight by a drag. | Fully interactive home-indicator swipe (follows finger, scales to 0.6, moves sideways, flies into the icon with the release velocity); swipe-and-hold opens the app switcher. |
| Scroll inside an app | Native scroll; at the top the list stays put. | Native scroll; hard stop at top and bottom. | No rubber-band. | Rubber-band overscroll at both ends for wheel/trackpad and touch, spring back with `smooth`. Large titles collapse into a frosted nav bar by scroll position. |
| Detail view + back | Rows open a pushed screen that slides from the right; back slides it out. | Slides from the right with a fixed 360 ms curve; parent doesn't move; no edge swipe. | Parent doesn't shift/dim; not interruptible; no edge-swipe back. | Spring-driven push; parent shifts −30 % and dims; interactive edge-swipe back from the left 24 px. |
| Finish swatches | Recolours the 3D body with a short blend (≈400 ms). | Instant swap. | No blend. | Body/frame colours lerp over 400 ms. |
| Theme toggle | (Reference studio stays dark.) | Circular reveal, ≈360 ms. | — | Keep; status pill now announces "Theme: Dark/Light". |
| Search | Opens a search field quickly (≈80–160 ms fade). | Appears instantly (no motion). | No motion, no gesture. | Pull down anywhere on the home screen: field follows the finger, home blurs and dims in proportion; buttons and ⌘K animate the same progress. |
| Mobile layout | No frame; the site is the phone; app opens/closes with the same zoom. | Same, full-screen OS. | No lock screen, no PWA, gestures need real touch tuning. | `100dvh` + safe areas, per-region `touch-action`, `overscroll-behavior: none`, installable PWA. |

### Measured rotation (reference)
Sampled Y angle of the screen layer after releasing a fast 800 px drag, every ~100 ms:
`166° → 105 → 59 → 23 → −5 → −27 → −43 → −56 → −66 → −74 → −79 → −82 (≈1.1 s) → −79 → −66 → −49 → −34 → −22 → −14 → −8 → −4 → −1 → 0 (≈3 s)`.
It decays like a spring that already pulls toward the front while still carrying the release
velocity: no pause, and no visible overshoot past the front.

### Long tasks (before)
Reference: one 70–100 ms task during load in every scenario. Ours: 63 + 157 ms on load, none
during interactions.
