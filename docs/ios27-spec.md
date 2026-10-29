# iOS 27 spec — what was read, and where it lives

The app shell, the lock screen and Journey follow **iOS 27 Builder** by Luch Dev (Figma Community,
file `7fp30JpDD6R8MRCEf9GysN`). Only values were taken from it: colours, type sizes, spacing, radii and
component measurements. No components, icons, images or fonts were copied. Apple's own **iOS and iPadOS 27**
community file (`ClYfkhyEVp6YXhlyWleSNA`, opened at node `0-3329`) was opened read-only to cross-check
the numbers. Nothing was exported, copied or duplicated from it, and where the two disagree the site uses Luch Dev.

**Where the values live.** `src/lib/ios-tokens.ts` is the map, with names taken from the kit. The `--ios-*`
variables in `src/app/globals.css` hold the same values (tests/tokens.spec.ts checks they match), and `.dark` on `<html>` switches every
colour at once. Tailwind exposes them as `bg-ios-*`, `text-ios-*` (colours and the type ramp) and
`rounded-ios-*`. The app roles (`--app-background`, `--app-group`, `--app-ink`, `--app-divider`) point
at the kit tokens, so the rest of the site follows from that one place.

Licence: the kit's About frame (`6209:34`) says "© 2026. All Rights Reserved. — Luch Dev". Its agent
skills (github.com/uladluch/figma-to-swiftui) are Apache 2.0. Credited in Settings → Credits and in the README.

## Read from iOS 27 Builder (Luch Dev)

Variables: the "Color" collection (modes Light / Dark), "Typography" (Dynamic Type sizes Large and xLarge),
"Spacing" and "Radius". Component masters live on the page `_Component Masters` and glass primitives on `_Primitives`.

### Colour (Light / Dark)

| Token | Light | Dark |
| --- | --- | --- |
| Labels/Primary | #000000 | #ffffff |
| Labels/Secondary | #3c3c43 @60% | #ebebf5 @60% |
| Labels/Tertiary | #3c3c43 @30% | #ebebf5 @30% |
| Labels/Quaternary | #3c3c43 @18% | #ebebf5 @16% |
| Labels/Link | #007aff | #0984ff |
| Backgrounds/Primary | #ffffff | #000000 |
| Backgrounds/Secondary | #f2f2f7 | #1c1c1e |
| Backgrounds/Grouped-Primary | #f2f2f7 | #000000 |
| Backgrounds/Grouped-Secondary | #ffffff | #1c1c1e |
| Backgrounds/Grouped-Tertiary | #f2f2f7 | #2c2c2e |
| Backgrounds/Grouped-Secondary - Elevated | #ffffff | #2c2c2e |
| Fills/Primary … Quaternary | #787880 @20 / 16, #767680 @12, #747480 @8 | #787880 @36 / 32, #767680 @24 / 18 |
| Fills - Vibrant/Primary | #cccccc | #333333 |
| Separators/Opaque | #e7e7e8 | #2a2a2c |
| Separators/Non-opaque | #3c3c43 @12% | #545458 @50% |
| Grays/Gray … Gray 6 | #8e8e93 #aeaeb2 #c7c7cc #d1d1d6 #e5e5ea #f2f2f7 | #8e8e93 #636366 #48484a #3a3a3c #2c2c2e #1c1c1e |
| Accents/Blue (systemBlue) | #0088ff | #0091ff |
| Accents/Red, Green, Orange, Yellow | #ff383c #34c759 #ff8d28 #ffcc00 | #ff4245 #30d158 #ff9230 #ffd600 |
| Accents/Cyan, Pink, Purple, Teal | #00c0e8 #ff2d55 #cb30e0 #00c3d0 | #3cd3fe #ff375f #db34f2 #00d2e0 |
| Accents/Indigo, Mint, Brown | #6155f5 #00c8b3 #ac7f5e | #6d7cff #00dac3 #b78a66 |
| Overlays/Default | #000000 @20% | #000000 @48% |
| Segmented Control - Selected Fill | #ffffff | #636366 |
| Buttons/BG - Destructive | #ff383c @14% | #ff4245 @14% |
| Scroll Edge Effect/Hard | #ffffff @85% | #000000 @55% |

### Dynamic Type (Large, the default; xLarge in brackets)

| Style | Size | Line | Tracking | Weight |
| --- | --- | --- | --- | --- |
| Large Title | 34 (36) | 41 (43) | 0.4 | Regular, emphasized Bold |
| Title 1 | 28 (30) | 34 (36) | 0.38 | Regular |
| Title 2 | 22 (24) | 28 (30) | −0.26 | emphasized Bold |
| Title 3 | 20 (22) | 25 (28) | −0.45 | emphasized Semibold |
| Headline | 17 (19) | 22 (24) | −0.43 | Semibold |
| Body | 17 (19) | 22 (24) | −0.43 | Regular |
| Callout | 16 (18) | 21 (23) | −0.31 | Regular |
| Subheadline | 15 (17) | 20 (22) | −0.23 | Regular |
| Footnote | 13 (15) | 18 (20) | −0.08 | Regular (tight leading 16) |
| Caption 1 | 12 (14) | 16 (19) | 0 | Regular |
| Caption 2 | 11 (13) | 13 (18) | 0.06 | Regular |

The kit sets these in SF Pro. The site keeps its own font (Geist) and uses the sizes in rem, so
Settings → Larger text (112.5%) behaves like the next Dynamic Type step.

### Spacing and radius

- Spacing: XXS 2, XS 4, S 8, M 12, L 16, XL 24, XXL 32, XXXL 48.
- Radius: XS 5, S 8, M 12, L 16, XL 20, XXL 26, Bubble 18, Sheet 38, Full 1000.

### Components (node ids)

| Component | Node | Measurements |
| --- | --- | --- |
| Row | 5977:28537 | Regular 52, Tall 68; padding 0 16; title Body / Labels-Primary, detail Body / Labels-Secondary |
| Header | 5977:28672 | Extra Prominent 48 (Title 2 emphasized), Prominent 45 (Title 3 emphasized), Nested 42 (Headline, Labels-Secondary); padding 10 16; never uppercase |
| Section Title | 5984:3126 | 39; Body emphasized, Labels-Secondary; background blur 100 |
| Grouped Table Footer | 5984:3119 | 30; padding 8 16 6 16; Footnote (tight leading), Labels-Secondary |
| Grouped section | 6383:11105 | radius 26 (XXL) |
| Toolbar - Top | 5917:3190 | inline 54, large-title 103 (402 wide iPhone); padding 0 16 10 16; buttons 44 × 44 glass circles |
| Toolbar - Bottom | 5948:1406 | 80; padding 4 28 32 28; gap 12; items spaced (ToolbarSpacer) |
| Tab Bar | 5721:5302 | 95 |
| Search Field | 6848:9932 | 48; capsule; padding 0 10 0 11; gap 4; glass with a white fill |
| Segmented control | 5813:2246 | 32; capsule (radius 100); padding 2; gap 4; track Fills/Tertiary; labels 13 semibold; selected pill 28 high |
| Button | 5802:2429 | heights 28 (small) / 34 / 44 / 48 / 50; capsule; small padding 0 12 |
| Toggle | 5803:19592 | 64 × 28; padding 2; knob 39 × 24 capsule, white; On Accents/Green, Off Labels/Tertiary |
| Sheet | 6379:2351 | surface radius 38 (glass inset 34); grabber 58 × 4 capsule, Fills-Vibrant/Primary |
| Grabber | 5901:23721 | 15 high area, padding 6 0 5 |
| Alert | 5891:22833 | 300 wide; radius 34; padding 14; gap 10; title 17 semibold, message 13; buttons 48 high capsules |
| Liquid Glass | 5693:1385 (`_Primitives`) | GLASS effect: radius 6, refraction 0.7, depth 30, dispersion 0.2, light 0° at 0.25; inner shadows 0 40 30 #e6e6e6 −40, 0 ±40 10 #1a1a1a −40 |

### Rules (the kit's "For Agent" frame, 6204:34)

- Use semantic tokens. Dark mode is one switch.
- Show a chevron only on rows that navigate.
- Links are #007AFF (Labels/Link); systemBlue is #0088FF. Don't swap them.
- Opaque separators are #E7E7E8 / #2A2A2C.
- Alerts have no filled primary button; alert buttons are not styled.
- Tabs (`.pickerStyle(.tabs)`) are a grey capsule with a white pill, not underlined segments.
- Bottom toolbar items need spacers between them.
- Tinted icon tiles are composed (a glyph on a colour), not images.
- Use Liquid Glass materials only for chrome.

## Cross-check against Apple's iOS and iPadOS 27

Read from the file's local text and colour styles and from its variable collections "Color Scheme"
(Light / Dark) and "Dimensions" (iPhone). These are plain values only.

| Value | Apple | Luch Dev (used) |
| --- | --- | --- |
| Type ramp (11 styles: sizes, line heights, tracking) | identical | — |
| Accents (12 colours, light); systemBlue dark #0091ff | identical | — |
| Backgrounds (plain and grouped, both modes) | identical | — |
| Separators/Opaque | #c6c6c8 / #38383a | #e7e7e8 / #2a2a2c |
| Separators/Non-opaque | #000000 @12% / #ffffff @17% | #3c3c43 @12% / #545458 @50% |
| Separators/Vibrant, dark | #1a1a1a | #38383a |
| Labels/Secondary, dark | #ebebf5 @70% | #ebebf5 @60% |
| Fills/Primary, light | #787878 @20% | #787880 @20% |
| Grabber | 60 × 4 | 58 × 4 |
| Sheet top radius | 38 (bottom 58, the device corner) | 38 |
| Margin | 16 | 16 |
| Home indicator | 144 × 5 (portrait) | — (the site's own 36% / max 140) |
| Popover radius / dock radius | 38 / 38 | — |

## Where the site departs from the kit (on purpose)

- **Secondary text.** The kit's Labels/Secondary is 60% grey, which is 3.4:1 on the grouped background.
  For 13–15 px text the site uses opaque greys of the same hue (#6c6c72 / #98989f, 4.5:1 or better).
  The kit value is still available as `--ios-label-secondary` for icons and placeholders.
- **Font.** Geist, not SF Pro (Apple's fonts are licensed for Apple platforms only).
- **Glass.** CSS has no refraction. The site's glass is `backdrop-filter` blur and saturation, with a
  bright top edge and the kit's inner shadows.
- **Accent.** The phone finish (Burgundy by default) stays the site's tint for buttons and switches.
  Links use Labels/Link.

## v10: Control Center, notifications and glass (four more kits, read 2026-10-29)

Each file's first page was read for a licence before anything else. Only measurements were taken
(sizes, spacing, radii, type, colours, glass values); nothing was exported, duplicated or copied, and
every control on the site is our own SVG and CSS. None of the four states a licence that allows more,
so none needs a credit beyond this record.

| Kit (Figma file) | What its first page says | How it was used |
| --- | --- | --- |
| Liquid Glass Control Center UI Kit (`aUgrYkIfaZpvy2EZNLhlsf`) | No licence or terms. The cover has only the title; the Read Me says its values are "measured from Apple's official iOS 26 kit". | Values only: the Control Center grid, module sizes, glass and colour variables. |
| Apple iOS 26 & iPadOS 26 UI Kit, community (`vpzTS14kp8KAooDn7Efl2V`) | A community adaptation inspired by Apple Design Resources, for non-commercial use, learning and design exploration, credited. | Values only, as a cross-check. It has no notification component. |
| iOS and iPadOS 26, Apple (`2cdxEjNphFl72aUphywVus`) | Using the resources means agreeing to the licence included in the library; © 2026 Apple Inc. All rights reserved. | No agreement was accepted. Published measurements only (the notification stack below). On Needs Chetan in docs/progress.md. |
| Glassmorphic UI Kit for iOS 26 (`YuUhFnLE5DS2alJftF2zSJ`) | No licence text. | Values only: blur and inner-shadow recipe for glass buttons. |

### Control Center (Liquid Glass kit, 402 × 874 frame)

- Grid: 4 columns of a 68 pt unit with 15 pt gutters (318 wide on a 402 screen), first row at y 130.
  The site scales the unit with the screen: `--cc-u: min(16.9cqw, 14.6cqh)`, gutter `u × 0.2206`.
- Modules: 2 × 2 cluster and Now Playing are 151 × 151, radius 30; round toggles 68; tall sliders
  68 × 151 and the 2 × 1 shortcut are full pills. Now Playing art 52, radius 14; title 15 / 510.
- Glass Regular: blur 6, depth 80, refraction 0.6, light 0.7 at 315°. Glass Clear: blur 5, depth 16,
  refraction 0.8, light 0.5, drop shadow 40 at black 20%. Tint #242424 (linear dodge) over dark,
  #000 at 7% over light.
- Variables: tile radius 30; symbol well #fff 6% / #000 8%; label #fff / #000 92%; detail #fff 33% /
  #000 45%; slider fill scrim #1c1c1e 85% over light; accent blue #0088ff, green #34c759.
- Landscape is the site's own: the same modules in two rows of eight.

### Notifications (Apple iOS 26)

- Card 386 × 63, radius 24; app icon 38 at (14, 12); text from x 62; title and body 15; time 58 wide.
- Stacks of 1, 2 and 3 are 64, 71 and 77 tall: cards behind are inset 20 and 40 (346 and 306 wide)
  at 90% and 80% opacity. Glass: white 7% (screen) with blur and a 40 drop shadow.
- The site's notifications are its own content (latest Substack post, latest reel, a project), never
  styled as system alerts from other apps.

### Glass buttons (Glassmorphic kit)

- Background blur 40; inner shadows 22 #f2f2f2 50%, 1 px #b3b3b3, 0.5 px white 50%; radii 48 / 100;
  fill #1d1d1d. Used as a reference for the Control Center rim, not copied as a component.

### Differences from iOS 27 Builder

- Corner radius: Control Center modules use the kit's 30 / 68 of a unit, not Builder's card radius.
- Detail text: the kit's 33% white is too faint for 12 px text on a busy wallpaper, so `--cc-detail`
  uses Builder's Labels/Secondary weight instead (60% white, 50% black).
- Everything else (type ramp, label colours, link blue) stays on the Builder tokens.
