# Chetan Pujari — Pocket Portfolio

A portfolio you use like a phone. The studio page holds an original CSS phone; every section is
an app on its home screen (Courses, Journey, Expertise, Platforms, Reviews, Projects, Blog,
Services, Contact, Settings), with a Socials folder, ⌘K Spotlight, deep links (`/#courses`,
`/#courses/google-veo`) and light/dark themes. Below 600px the site *is* the phone.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS v4, Motion, Zustand
and Zod. On desktop the phone turns into a React Three Fiber 3D model (CSS phone without WebGL or
with reduced motion). Optional: an "Ask Chetan" AI app, off by default.

- **Edit content:** everything visitors read is in `content/*.ts` — see [CONTENT.md](CONTENT.md).
- **Status / to-do for Chetan:** [docs/progress.md](docs/progress.md).

## Run locally

Requires Node.js 20.9+ (tested on Node 24).

```bash
npm install
cp .env.example .env.local   # optional: fill in keys (see "Deploy to Vercel")
npm run dev                  # http://localhost:3000
```

Production build:

```bash
npm run build && npm run start   # add `-- -p 3100` for another port
```

## Checks

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run content:check # validate content/*.ts against the schemas
npx playwright install chromium   # once
npm test              # Playwright: smoke tests + visual snapshots (builds and serves on :3100)
npx playwright test --update-snapshots   # after an intentional visual change
```

Extra scripts (run against a server on :3100): `node scripts/check-os.mjs <outDir>` (click-through),
`node scripts/a11y.mjs` (axe + keyboard), `node scripts/screenshots.mjs <outDir> [path]`
(3 sizes × 2 themes). The Anti-Doom and StackUp project covers come from
`node scripts/project-covers.mjs <dashboard.png> <vision.png> <logo.png>` (no server needed).

## Deploy to Vercel

1. [vercel.com/new](https://vercel.com/new) → import `chetanpujari5105/NFCPortfolio`. Next.js is
   detected; keep the default build settings (`npm ci`, `npm run build`) and production branch `main`.
2. Add any variables below under *Settings → Environment Variables* (all optional), then **Deploy**.
3. Add `chetanpujari.com` under *Settings → Domains*.

CLI: `npx vercel link`, `npx vercel env add <NAME> production` per variable, then `npx vercel --prod`.

| Variable | Used for | Without it |
|---|---|---|
| `RESEND_API_KEY` | Contact form email via Resend (server only) | Form shows "email me directly" |
| `CONTACT_TO_EMAIL` | Where contact messages go | `profile.email` |
| `CONTACT_FROM_EMAIL` | Sender on a domain verified in Resend, e.g. `Chetan <hello@chetanpujari.com>` | `onboarding@resend.dev` (Resend test sender) |
| `NEXT_PUBLIC_ENABLE_ASK` | `true` shows the Ask Chetan app | Hidden |
| `OPENAI_API_KEY` | Ask Chetan answers (server only) | App shows "email me directly" |
| `OPENAI_MODEL` | Model for Ask Chetan | `gpt-5-mini` |
| `GITHUB_TOKEN` | GitHub heatmap via GraphQL; a fine-grained token with no permissions is enough (server only) | Parses the public contributions page; if GitHub can't be reached, the committed snapshot (`public/content/github-contributions.json`, refresh with `npx tsx scripts/github-snapshot.mts`) |
| `NEXT_PUBLIC_ICON_PACK` | `original` draws every app with the original gradient-and-glyph icons | `ios18`: the iOS 18 App Icons pack (see Credits) |
| `NEXT_PUBLIC_SHOW_MODEL_LOGO` | `true` shows the 3D model's own back logo (only once its licence allows it) | The ⚡ CP mark |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO, sitemap and OG images | `VERCEL_PROJECT_PRODUCTION_URL` (set by Vercel), then `https://chetanpujari.com` |

`NEXT_PUBLIC_*` values are baked in at build time, so redeploy after changing them. For local
development, copy `.env.example` to `.env.local`.

## Credits

iOS 18 App Icons by David Akhmedbayev, CC BY 4.0, via Figma Community. iPhone and the app designs
they depict are trademarks of Apple Inc. They are the tile faces for ten apps
(`public/icons/ios18`, built by `scripts/ios18-icons.mjs`; licence and changes in
[`public/icons/ios18/LICENSE.txt`](public/icons/ios18/LICENSE.txt)). `NEXT_PUBLIC_ICON_PACK=original`
switches back to the original set. The original glyphs and faces, squircle mask, wallpaper shader, the CSS phone frame and copy are original. The desktop 3D phone is a third-party iPhone 18 Pro Max model (`public/models`, built by
`scripts/optimize-phone-model.mjs`); its back shows the ⚡ CP mark in place of the maker's logo
unless `NEXT_PUBLIC_SHOW_MODEL_LOGO=true`. iPhone is a trademark of Apple Inc. Brand logos:
[Simple Icons](https://simpleicons.org/) (CC0) and Font Awesome Free (CC BY 4.0, LinkedIn). The world map is rasterised from
[Natural Earth](https://www.naturalearthdata.com/) (public domain). Fonts: Geist and Archivo via
`next/font` (SIL OFL).
