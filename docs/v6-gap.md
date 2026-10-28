# v6 gap: home screen vs the quality reference

Reference for quality and feel: https://www.prsd.dev/#home. Only **measurements** were taken from it
(geometry, computed styles, pixel ratios). No code, text, images, icons, fonts or 3D model were reused.

How it was measured: `node scripts/gap-measure.mjs docs/v6 http://localhost:3100 --theme=light|dark`
(Playwright, `getBoundingClientRect` + `getComputedStyle` on the same element on both sites, and sharp
pixel analysis of each tile: glyph box as % of the tile, face colour at 30% and 82% height).
The raw numbers are in `docs/v6/gap-measurements-{light,dark}.json`. Side-by-side crops (reference
left, ours right, ours scaled to the reference's screen width) are written to `docs/v6/compare/`.
Those PNGs contain the reference's screenshots, so they are **gitignored** (`/docs/v6/*/*.png`) and
stay on this machine. Regenerate them with the command above.

Viewports: 1440×900 (our 3D phone; the reference's flat phone) and 390×844 (both full-screen).
"Before" is commit `bebc040` (v6 icons). "After" is commit `a826137` (the reference-measured pass).
The **final polish** section at the end has the numbers after the last pass (dock, rows, labels,
home indicator, wide widget, status bar); where it disagrees with the tables above, it wins.

## Icons

| | Reference | Before | After |
|---|---|---|---|
| Tile size @390 | 59 px (15.1% of screen) | 60.1 px | 60.1 px |
| Tile size @1440 | 50.7 px in a 319 px screen (15.9%) | 53.5 px in 347 (15.4%) | 53.5 px (15.4%) |
| Corner | `border-radius: 14px` (23.7%, plain arc) | superellipse n=5 mask | superellipse n=5 mask (kept: continuous corner, iOS proportion) |
| Column pitch @390 | 91 px | 91 px | 91 px |
| Row pitch @390 | 100 px (1.69 tiles) | 109–110 px | 102 px |
| Row pitch @1440 | 87–88 px (1.71 tiles) | 98 px | 93 px (1.74 tiles) |
| Face | flat or near-flat images | 3-stop gradient + radial highlight + inner shadow + edge ring | **one 2-stop vertical gradient**, nothing else |
| Tile shadow | `0 3px 7px rgb(0 0 0/.13)` | two drop-shadows (0.5 px hairline + 0.035/0.075 of the tile at .17) | `drop-shadow(0 .05·icon .06·icon rgb(0 0 0/.14))` (3 px / 3.6 px at 60) |
| Glyph | one flat mark, 53–75% of the tile | white→tinted gradient, second-tone layers at 50–85% opacity, drop shadow; 42–51% of the tile | **flat white, one tone, no shadow; 57–59% at its widest** (rocket 49×58, tall) |
| Glyph weight | n/a (images) | mixed (opacity layers read thinner) | one silhouette weight; parts parted by gaps and cut-outs |
| Brand tiles | LinkedIn mark 58% | LinkedIn ~45%, X ~45% | LinkedIn 55%, X 57% (official simple-icons / FA marks, official colours) |
| Dark mode | **identical to light** | icons turned dark (colour moved into the glyph) | identical to light |

## Labels

| | Reference | Before | After |
|---|---|---|---|
| Size / weight | 10 px / 400 (at 50.7 and 59 px tiles) | 12 px / 450 at 60 px | `clamp(10px, .17·icon, 11px)` / 400 (10.2 px at 60) |
| Line height | 14 px | 14.4 px (1.2) | 13.8 px (1.35) |
| Colour | #fff | #fff | #fff |
| Shadow | `0 1px 7px rgb(0 0 0/.6)` | `0 .5px 1.5px /.5, 0 0 6px /.22` | `0 1px 7px /.6` + a tight `0 .5px 1px /.3` for our brighter wallpaper gloss |
| Tile → label gap | 6–7 px | 5 px | `.11·icon` (6.6 px at 60) |
| Font | system font stack | stack that named "SF Pro Text" | `system-ui, "Segoe UI", Roboto` (no Apple font named or bundled) |

## Widgets

| | Reference | Before | After |
|---|---|---|---|
| Wide (4×2) @390 | 350×149, radius 29 | 346×169, radius **24% (elliptical 83×40 px: stretched)** | 346×162, radius 26.4 (`.44·icon`) |
| Small (2×2) @390 | 168.5×166, radius 25 | 165×169, radius 24% (elliptical) | 165×162, radius 26.4 |
| Material, dark widget | opaque graphite gradient `#242426→#101011`, 1 px hairline, `inset 0 1px 1px /.09`, `0 2px 5px /.2` | translucent glass `rgb(255 255 255/.18)` + blur 20 (Impact) | `.widget-graphite`: opaque `#262628→#111112`, 1 px hairline, lit top edge, `0 2px 6px /.2` |
| Material, light widget | opaque white, 1 px hairline, `0 2px 8px /.07` | white (`app-surface`, **went dark in dark mode**), `0 4px 14px /.18` | `.widget-light`: white, hairline, `0 2px 8px /.08`; same in dark |
| Padding | 13–14 px | 13 px (Work), 13.9 px side only (Impact) | 10–14 px (`clamp`, container units) |
| Kicker | 9 px / 600, +0.3 px tracking | 9 px / 700, +0.45 px | 8.5–9.5 px / 600, +0.04 em |
| Title | 25 px / 700, −1 px tracking | 16.7 px / 700, −0.42 px | 17–24 px / 700, −0.035 em (Work: 23 px at 390) |
| Secondary text | 11 px / 400, grey | 10–11 px / 500, white/70 | 9.5–11 px / 400, white/60 or `app-muted` |
| Dark mode | unchanged | Work widget, GitHub, Expertise went dark | unchanged (tokens pinned light inside `[data-widget-tile]`) |

## Dock, Search pill, status bar, folder

| | Reference | Before | After |
|---|---|---|---|
| Dock @390 | 360×87, radius 30, `rgb(255 255 255/.19)` + `blur(22px)`, 1 px hairline, `inset 0 1px 1px /.21`, `0 3px 12px /.07` | 358×84, radius 30, gradient `/.26→/.16` + blur 30 saturate 190% brightness 1.06, dark variant | 360×84, radius 30, `/.19` + `blur(22px) saturate(170%)`, same hairline / top light / shadow; no dark variant |
| Dock icon pitch @390 | 92 px (12 px padding, spread edge to edge) | 84 px | 92 px |
| Dock bottom margin @390 | 28 px (with home indicator) | 8 px | 12 px (or the safe-area inset on a real phone) |
| Search pill | 64–74×24–27, radius 20, `/.15` + `blur(18px)`, 11 px label | 118×28, `/.16` + blur 28 saturate 180%, 12.5 px label, dark variant | 115×26 (holds our page dots too), `/.16` + `blur(18px) saturate(160%)`, 11.5 px label |
| Page dots | none (one page) | inside the Search pill | inside the Search pill (two pages) |
| Status bar time | 15 px / 600, −0.4 px | 14.2–16 px / 600, −1% | unchanged |
| Folder tile | none | frosted squircle + dark variant | frosted squircle `/.24` + `blur(22px)`, no dark variant |
| Wallpaper in dark | unchanged | dimmed ×0.82 | unchanged |

## Final polish (re-measured with `scripts/gap-measure.mjs`, light and dark)

Values at 390×844 come straight from the reference. On the 3D phone (1440×900, a 347×751 screen)
and the CSS phone they scale with the screen height, the same way: margins and gaps as a share of
the screen height, dock padding as a share of the icon.

| | Reference @390 | Ours @390 | Reference @1440 | Ours @1440 | Rule |
|---|---|---|---|---|---|
| Dock size | 360×87 | 360.4×87 | 289.6×78.7 | 320.6×77.4 | padding `.224·icon` (13.5 px at 60) |
| Dock bottom margin | 28 px | 28 px | 24.7 px | 25 px | `3.3%` of screen height (a real phone: at least the safe-area inset) |
| Search pill → dock | 17 px | 17 px | 13.4 px | 15 px | `2%` of screen height; 10 px above the pill |
| Dock icon pitch | 92 px | 92 px | 72 px | 82 px | icons spread edge to edge |
| Home indicator | 134×5 bar | (the phone's own) | bar | 35% × 5 px, white/85, 1% from the bottom | drawn phones only, `pointer-events: none`, under the dock |
| Wide widget (Impact) | 350×149, padding 13 | 346×149, padding 13 | 281×132.1 | 308×132.7 | height `2.48·icon`, centred in its 2-row slot |
| Wide widget type | title 25 px / 700 / −1 px, secondary 11 px / 400 | numbers 25 px / 700 / −0.04 em, labels 11 px / 400 | | 23–25 px / 11 px | never below the reference |
| Status bar time | 15 px / 600 / −0.4 px | (hidden: the phone's own) | 15 px / 600 / −0.4 px | 15 px / 600 / −0.4 px | `clamp(12px, 4.4cqw, 15px)`; font `system-ui` (no Apple font named) |
| Page 1 rows | | 6 full rows of 4 | | 6 full rows of 4 | LinkedIn, X, Udemy, GitHub; Socials keeps Instagram, AI Instagram, Substack |
| Row pitch | 100 px | 103 px | 87–88 px | 93 px | unchanged |

### Label contrast (`node scripts/label-contrast.mjs`)

White label over the live wallpaper alone (home layer hidden), 95th-percentile luminance in each
label box over 4 frames 1.5 s apart, at 390×844, 834×1112 (CSS phone) and 1440×900 (3D phone),
every finish, light and dark: **48 runs, every label ≥ 5.6:1** (worst: YouTube on Electric @1440).
Before this pass: as low as **1.0:1** (Electric), Burgundy Platforms 1.8, Projects 2.9.

| Finish | Platforms | Reviews | Projects | Settings | Worst label |
|---|---|---|---|---|---|
| Burgundy | 6.0 | 7.6 | 6.2–6.5 | 7.3–7.6 | 5.7 (YouTube @1440) |
| Electric | 5.8 | 5.9 | 5.8–5.9 | 5.7–5.9 | 5.6 (YouTube @1440) |
| Graphite | 5.8 | 6.1 | 5.9–6.0 | 5.8–6.1 | 5.6 |
| Chai | 5.9 | 6.1–6.2 | 5.9–6.0 | 5.9–6.2 | 5.6 |

How: the wallpaper shader compresses highlights behind every label row (the rows are read from
layout when the home geometry, layout or lock state changes, never per frame) toward a luminance
cap of ~0.16 with a soft knee, and everywhere else toward a gentler cap of ~0.58, so gloss still reads
as gloss. It fades out on the lock screen. The CSS fallback (no WebGL) darkens its brightest glow.
The dock has no labels; its glass sits over the same compressed wallpaper.

## What is still different (on purpose)

- The reference's icons are full-colour illustrations; ours are original flat white glyphs on gradients
  (the brief: one bold flat white glyph, no Apple artwork).
- Our Search pill also carries the page dots, because the home screen has two pages (115×26 vs 74×27).
- Row pitch is 103 px against 100: our labels sit in a 13.8 px line, and six rows plus the dock fill the screen.
- The wide widget's corner is `.44·icon` (26.4 px at 390, 23.5 px at 1440) against the reference's fixed 29 px.
- The squircle stays a superellipse mask rather than the reference's plain `border-radius`: the
  continuous corner is the native iOS shape.
