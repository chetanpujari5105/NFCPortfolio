# Morning report (overnight run, 2026-10-29)

Short version: the site is live and healthy on the latest `main` (8cdd6a7). Two tasks stopped at a login wall, so they're on your list below: Resend (not signed in) and the GitHub token (passkey "Confirm access"). Until you add `RESEND_API_KEY` the Contact form shows "Email isn't set up" with a prefilled "email me directly" link and keeps the visitor's text.

## What I did

| # | Task | Result |
| --- | --- | --- |
| 1 | Merge `fix/contact-email`, push, restart prod :3100 | Done. `main`, `origin/main` and `nfc-portfolio-prod` all at 8cdd6a7; :3100 runs from `nfc-portfolio-prod`. |
| 2 | Resend key, domain, Vercel env, test send | **Blocked.** resend.com redirected to the login page, so I'm not signed in there. No key created, no Vercel env vars added, no test message sent. See "Needs Chetan". |
| 3 | Vercel deployment + live checks | Done. Latest production deployment `dpl_ATHHXT8gtXWEmDrsyTQzdMLpev86` is **Ready** (41 s build) and `nfcportfolio-two.vercel.app` points to it, running 8cdd6a7. No build failure, so no `fix/vercel-build` branch. Live checks below all pass except sending (needs the key). |
| 4 | GitHub token `portfolio-heatmap` | **Blocked.** github.com → new fine-grained token asked for "Confirm access" (passkey). Stopped there; no token created. The heatmap works without it (public page + snapshot fallback). |
| 5 | Expertise autoplay | No change: it stops at card 8, as decided. |
| 6 | Repo hygiene | Clean. gitleaks over all 45 commits: no leaks. Tracked env files: only `.env.example` (no values). No keystores, `google-services.json` or `.env.local` tracked. The private Anti-Doom repo URL appears nowhere on the live site (HTML + JS chunks), in the build output, or in tracked files. The only repo link is the public StackUp one. |
| 7 | Cleanup + final checks | Deleted 10 merged **local** branches with `git branch -d` (nothing deleted on GitHub). Kept `main`, `docs/guide` and the `docs/guide WIP` stash. Final numbers below. |
| 8 | This report | Done; also an "Overnight run" section in `docs/progress.md`. |

## URLs checked

- https://nfcportfolio-two.vercel.app/ (home pages 1 and 2)
- https://nfcportfolio-two.vercel.app/#projects
- https://nfcportfolio-two.vercel.app/#contact
- https://nfcportfolio-two.vercel.app/api/contact (probe: a cross-origin POST returns 403 `forbidden`, which only the new route does, so the live build is 8cdd6a7)
- Vercel deployment `nfcportfolio-3ivag5phs-chetanpujari5105s-projects.vercel.app` (Ready; behind Vercel Authentication, so checked via the public alias)
- https://resend.com/api-keys and /domains → login page (blocked)
- https://github.com/settings/personal-access-tokens/new → "Confirm access" passkey (blocked)

## Live site checks (Playwright, 390x844 and 1440x900, light and dark)

| Check | Result |
| --- | --- |
| Home page 1 paints | Pass. 14 icons, no blank slots, in all 4 runs. |
| Home page 2 paints | Pass. No blank slots. |
| GitHub heatmap shows immediately | Pass. Visible in 8–97 ms, 116 squares, "1,009 contributions in the last year". |
| Expertise stack swipes | Pass. One swipe → "Expertise, 2 of 8: UI/UX Design", and the pager stays on page 2. |
| YouTube widget | Pass. "Latest video: sidekick launch v3 1080p" from @ImaginaryProgrammer. |
| Projects shows Anti-Doom and StackUp | Pass. |
| Contact form sends | **Not yet.** The API answers 503 `unavailable` (no `RESEND_API_KEY` on Vercel). The form shows "Email isn't set up…", the mailto fallback, and keeps the text. Works once you add the key. |
| Console errors | Only the browser's own "Failed to load resource: 503" from that contact request. Nothing from the site's code. |

## Final checks on `main` (8cdd6a7)

- Lint: pass (exit 0)
- Typecheck: pass (exit 0)
- Content check: pass
- Build: pass
- Playwright (full suite, 696 tests, `--retries=1`, 5.6 min): **381 passed, 5 failed, 310 skipped, 0 flaky.** The 5 failures are the known throttled phone launch-speed checks (`tests/speed.spec.ts`, "window moving" measured about 57–63 ms against a 50 ms budget). They fail the same way on earlier `main` builds, so they're not regressions. The skips are tests that only run on one device type, such as the contact API tests (desktop only).

## Screenshots (in `docs/morning/`, gitignored)

`home1`, `home2`, `projects` and `contact`, each at `390x844` and `1440x900`, in light and dark (16 files, e.g. `docs/morning/home2-1440x900-dark.png`). All taken from the live site.

## Needs Chetan (morning)

1. **Resend (the form can't send until this is done).** Sign in at resend.com, then:
   - API Keys → Create → name `portfolio`, permission **Sending access**. Copy it once.
   - Domains → Add `chetanpujari.com` (or the domain you'll use). Resend then shows the exact records to add: an MX and a TXT (SPF) on a `send` subdomain, and a TXT DKIM record `resend._domainkey`. I couldn't read them because I wasn't signed in. Add them at your DNS provider and click Verify.
   - Vercel → nfcportfolio → Settings → Environment Variables (Production): `RESEND_API_KEY` = the key; `CONTACT_FROM_EMAIL` = `Chetan Pujari <hello@chetanpujari.com>` once the domain is verified. **Before it's verified:** leave `CONTACT_FROM_EMAIL` unset and set `CONTACT_TO_EMAIL` to your Resend sign-in email (the test sender only delivers there).
   - Redeploy, send yourself a message from the live form, and look for "Message sent". If it fails, Vercel → Logs shows a `[contact]` line that names the setting to fix.
2. **GitHub token (optional).** github.com → Settings → Developer settings → Fine-grained tokens → Generate. Name `portfolio-heatmap`, public repositories (read-only), no extra permissions. Set it as `GITHUB_TOKEN` in Vercel (Production) and in `nfc-portfolio-prod/.env.local`, then redeploy. Blocked overnight by the passkey prompt.
3. **Apple icon pack.** Your call whether to keep the iOS 18 pack on the public site. `NEXT_PUBLIC_ICON_PACK=original` in Vercel (then redeploy) is the safe fallback. I didn't change the default.
4. **3D model licence.** The iPhone 18 Pro Max model has no licence file (its export says "Binkies MDM"). Confirm where it came from and that it can be used on a public site, then add `public/models/LICENSE-iphone-18-pro-max.txt`. `NEXT_PUBLIC_SHOW_MODEL_LOGO` stays off.
5. **Anti-Doom Play Store link.** If it's live, put the URL in `url` for `anti-doom` in `content/projects.ts`. Until then the card has no Open button.
6. **StackUp status.** Confirm "Closed alpha on Google Play" is still true, and whether the card should link to the public repo or a Play Store listing.
7. **Real-phone test checklist** (iPhone Safari and Android Chrome; also an in-app browser like Instagram or LinkedIn):
   - [ ] Home page 1 and 2 load with every icon and widget; the heatmap is never blank.
   - [ ] Expertise stack: a vertical swipe moves one card, follows your finger, and springs back at the ends. It never scrolls the page or pulls down Search. A sideways swipe on it still changes page.
   - [ ] A tap on the stack opens Expertise at that card; long-press still enters jiggle mode.
   - [ ] Autoplay moves about every 6 s, stops at 8, and stops for good once you touch it.
   - [ ] Contact (after step 1): send a message with the keyboard up. The Send button spins, then "Message sent" and the pill. Turn on airplane mode and send: the text stays and there's a Try again.
   - [ ] Projects: Anti-Doom and StackUp cards open and look right in light and dark.
   - [ ] Landscape, and with the browser toolbars shown and hidden: the phone fits.
   - [ ] A repeat visit loads instantly.

The full list (reviews, domain, Packt URL, etc.) stays in `docs/progress.md` → "Needs Chetan".
