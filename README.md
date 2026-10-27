# Chetan Pujari — Pocket Portfolio

A portfolio you use like a phone. The studio page holds an original CSS phone; every section is
an app on its home screen (Courses, Journey, Expertise, Platforms, Reviews, Projects, Blog,
Services, Contact, Settings), with a Socials folder, ⌘K Spotlight, deep links (`/#courses`,
`/#courses/google-veo`) and light/dark themes. Below 600px the site *is* the phone.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS v4, Motion, Zustand
and Zod. Optional: a React Three Fiber 3D phone and an "Ask Chetan" AI app, both off by default.

- **Edit content:** everything visitors read is in `content/*.ts` — see [CONTENT.md](CONTENT.md).
- **Status / to-do for Chetan:** [docs/progress.md](docs/progress.md).

## Run locally

Requires Node.js 20.9+ (tested on Node 24).

```bash
npm install
cp .env.example .env.local   # optional: fill in keys (see below)
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
(3 sizes × 2 themes).

## Environment variables

All optional; the site degrades gracefully without them. Secrets stay on the server.

| Variable | Used for | Without it |
|---|---|---|
| `RESEND_API_KEY` | Contact form email via Resend | Form shows "email me directly" |
| `CONTACT_TO_EMAIL` | Where messages go | `profile.email` |
| `CONTACT_FROM_EMAIL` | Verified sender, e.g. `Chetan <hello@chetanpujari.com>` | `onboarding@resend.dev` (Resend test sender) |
| `NEXT_PUBLIC_ENABLE_ASK` | Show the Ask Chetan app (`true`) | Hidden |
| `OPENAI_API_KEY` | Ask Chetan answers | App shows "email me directly" |
| `OPENAI_MODEL` | Model for Ask Chetan | `gpt-5-mini` |
| `NEXT_PUBLIC_ENABLE_3D` | 3D phone on desktop (`true`) | CSS phone |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for SEO / OG | Vercel production URL, then `https://chetanpujari.com` |

`NEXT_PUBLIC_*` values are baked in at build time — redeploy after changing them.

## Deploy to Vercel

**Dashboard:** push this repo to GitHub → [vercel.com/new](https://vercel.com/new) → import it →
framework "Next.js" is detected (no settings to change) → add the environment variables above
under *Settings → Environment Variables* → Deploy. Add your domain under *Settings → Domains*.

**CLI:**

```bash
npm i -g vercel          # or use npx vercel
vercel link              # create/link the project
vercel env add RESEND_API_KEY production   # repeat for each variable you need
vercel                   # preview deployment
vercel --prod            # production
```

For real contact emails, verify your domain in Resend and set `CONTACT_FROM_EMAIL` to an address
on it.

## Credits

Icons, wallpaper shader, phone frame and copy are original. The world map is rasterised from
[Natural Earth](https://www.naturalearthdata.com/) (public domain). Fonts: Geist and Archivo via
`next/font` (SIL OFL).
