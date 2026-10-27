# Reference notes (prsd.dev) — behavior only

Plain-language notes on *how the reference feels*. Nothing here is copied: no code, text,
images, icons, 3D model or fonts from prsd.dev are used in this project. Screenshots live in
`docs/reference/` (gitignored) and are for comparison only.

Observed 2026-10-27 with Playwright (1440×900 and 390×844, light + dark color scheme).

- **Layout.** Desktop: phone centered, roughly 80% of the viewport height; name + 3 nav links
  right-aligned on the right; two round finish swatches top-left, selected one has a light ring.
  The studio around the phone stays dark in both color schemes on the reference (ours follows
  the theme, per our spec).
- **Phone width.** On a 390px viewport there is no frame: the home screen fills the screen and
  the status bar is the device's own.
- **Opening an app.** Clicking an icon sets the hash (`#experience`), updates `document.title`
  to "App · Name", and the matching nav link on the right becomes bold. By ~160ms the app is
  already near full size — the expansion is fast and spring-like, with little overshoot.
- **App chrome.** A small round back chevron button top-left, a large bold title, a muted
  one-line subtitle, then grouped rounded cards with hairline dividers and right chevrons.
- **Closing.** `Esc` returns to `#home` and the window collapses back toward the icon.
- **Settings.** Profile row card at the top, then grouped rows with small coloured squircle
  glyphs (General, Accessibility, Display, Wallpaper), a floating search field at the bottom.
- **Home.** Full-width widget on top, a 2×2 light widget beside a 2×2 block of icons, one more
  icon row, an empty area, a small frosted "Search" pill, then a frosted dock and home bar.
- **Theme reach.** Changing the theme affects the apps; finish swatches recolour the frame and
  wallpaper tint.

Our implementation is original: own icon set, own wallpaper shader, own CSS phone frame, own
copy, own code (Motion `layoutId`, Zustand store, hash router).
