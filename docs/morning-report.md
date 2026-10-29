# Morning report (2026-10-29)

## v10 Parts A and B: real reviews, lock screen, Control Center, home

Short version: Reviews now has 16 real Udemy reviews, word for word, in an App Store-style app. The lock clock fits every screen. The lock screen shows three of the site's own notifications. Control Center is rebuilt on the Liquid Glass kit's grid. The home screen has AI Instagram and Services on page 1 and Settings on the dock. It's live on nfcportfolio-two.vercel.app (`main` f02bb15, Vercel Production `nfcportfolio-hwupep9c5` Ready, :3100 rebuilt). Live checks pass 75/75, and one real contact message was sent (200, "Message sent").

| # | Part | Result |
| --- | --- | --- |
| A | Reviews (e2b1383) | 16 five-star reviews from 9 courses, read by hand on Udemy (no crawling, no avatars). The text is copied exactly, one review per person. The app has a summary computed from the shown reviews (plus the Udemy profile counts, labelled), a paged glass carousel and "See All Reviews" with course chips. Rows open the course. |
| B1 | Lock clock fit (68dbefa) | Measured from the phone screen's own box, with 5% side margins, under the date and clear of the island. `tests/lock-fit.spec.ts` covers 7 sizes, 4 times, Larger Text, reduced motion and fonts still loading. |
| B2 | Notifications (eee99bd) | Latest Substack post (opens in Blog), latest reel (Instagram, new tab), Sidekick (Projects). Older ones stack; tap spreads; swipe left clears one. |
| B3 | Control Center (5cd1c62) | 2x2 cluster (Dark mode, Reduce motion, Larger text, Flashlight), Now Playing (latest video), Finish and Wallpaper glass menus, Contact shortcut, brightness and text size sliders. Every control does something real. |
| B4 | Home (8caf631) | AI Instagram and Services on page 1, dock = Courses, Blog, Contact, Settings. GitHub moved into Socials (it keeps its page-2 widget), so rows stay full and no link was removed. |
| C | Rest of v10 | Journey, tokens, shell pass, YouTube fallback and credits were already on `main`. The app password still needs you (Chrome's extension was disconnected this time, so I didn't try). |
| — | Tests | Lint, typecheck and build are clean. The full suite passes except the 5 known throttled speed checks (58–66 ms on one worker, the same as since v5). Visual baselines for lock and home were updated on purpose. |

Figma kits (licences, measurements and differences from iOS 27 Builder): `docs/ios27-spec.md`, section "v10". None allows more than values, so no new credits were added.

### Screenshots (local, gitignored)

- Lock fit before/after: `docs/v10/lockfit/lock-844x390-before.png`, `lock-844x390-after.png`, `lock-360x640-after.png`; notifications `docs/v10/lockfit/notes-*.png`
- Control Center: `docs/v10/cc/cc-{390,land,desk}-{light,dark}.png` and `-finish-` variants
- Home: `docs/v10/home/home-{390,360}-{light,dark}.png`
- Reviews: `docs/v10/reviews/`
- Live: `docs/v10/live/*.png` (390x844 and 1440x900, light and dark, plus `lock-360x640-light.png` and `contact-sent-390x844-light.png`)

### Needs Chetan (new)

- Reviews were copied from Udemy; remove any you don't want public. Left out on purpose: accounts named "Chetan", "Genstruct Sapna", "Shaila", "Shaila P" and anyone surnamed Pujari.
- Apple's own iOS 26 kit says using it means agreeing to its licence. I accepted nothing and took only published measurements for the notification stack. Say if you'd rather drop those.
- When you post a new reel, update `content/lock-notes.ts`.
- Delete the Google app password "NFCPortfolio" (keep "portfolio").
- Try Control Center, the notifications and the new home layout on a real phone. Your own browser keeps its saved home layout until Settings → Reset Home Screen.

---

## v10 follow-up: iOS 27 tokens and the shell consistency pass

Short version: the whole app shell now follows the iOS 27 Builder kit (Luch Dev). That covers bar, large title, grouped lists, rows, toggle, segmented control, sheets, alerts and search, in light and dark. It's live on nfcportfolio-two.vercel.app (`main` 586642b, Vercel Production Ready, :3100 rebuilt). Live checks pass 56/56. The Google app password still needs your passkey.

| # | Task | Result |
| --- | --- | --- |
| 1 | Read the kit tokens without the network | Done. Read through Figma's plugin API in ~1 KB pieces. The old receiver (PID 95647, port 47123) was stopped first, and the clipboard wasn't used. |
| 2 | Tokens in one place | `src/lib/ios-tokens.ts` plus the `--ios-*` variables in `globals.css` (one `.dark` switch); `tests/tokens.spec.ts` keeps them equal. Spec and node ids: `docs/ios27-spec.md`. |
| 3 | Cross-check with Apple's iOS and iPadOS 27 | Opened read-only, numbers only; no licence prompt appeared. The type ramp, accents and backgrounds match. Where the files differ (separators, grabber 60 vs 58, two fills), the site uses Luch Dev. |
| 4 | Shell consistency pass | Done, 6431747. Shared shell plus Blog, Contact, Courses, Services, Reviews, Projects, Settings, Journey and the Home Screen alerts. |
| 5 | Credits | Settings → Credits and README: "iOS 27 Builder by Luch Dev", values only; "iPhone, iOS and iPadOS are trademarks of Apple Inc." |
| 6 | Tests | Lint, typecheck and build are clean. Full suite: all pass except the 5 known throttled speed checks and the visual baselines the redesign changed. Those baselines were updated on purpose, and `visual.spec` then passes 60/60. |
| 7 | Deploy + live checks | `nfcportfolio-l1nniwpi0` Ready. 56/56 live checks (390x844 and 1440x900, light and dark). No new contact message was sent. |
| 8 | App password "NFCPortfolio" | **Stopped at the passkey again.** Nothing was clicked or read. |
| 9 | Disk | 14 GiB free. Branch build output, test results and the raw before/after PNGs were deleted; the JPEG sheets are kept. |

### Extracted tokens (main ones; full table in `docs/ios27-spec.md`)

| Token | Light | Dark |
| --- | --- | --- |
| Labels/Primary | #000000 | #ffffff |
| Labels/Link | #007aff | #0984ff |
| Accents/Blue (systemBlue) | #0088ff | #0091ff |
| Backgrounds/Grouped-Primary | #f2f2f7 | #000000 |
| Backgrounds/Grouped-Secondary | #ffffff | #1c1c1e |
| Separators/Opaque | #e7e7e8 | #2a2a2c |
| Fills/Tertiary (segmented track) | #7676801f | #7676803d |
| Accents/Green (toggle on) | #34c759 | #30d158 |

| Metric | Value |
| --- | --- |
| Type ramp | Large Title 34/41 · Title 2 22/28 · Title 3 20/25 · Headline/Body 17/22 · Subheadline 15/20 · Footnote 13/18 · Caption 12/16 (rem) |
| Radii | 5 · 8 · 12 · 16 · 20 · 26 (grouped) · 34 (alert) · 38 (sheet) · capsule |
| Spacing | 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Rows / headers | 52 regular, 68 tall; Nested header 42 (Headline, grey, no caps); inset 16 |
| Bars | nav buttons 44; inline bar 54; search 48 capsule; segmented 32 capsule; toggle 64x28 (knob 39x24) |

### Screenshots

Before/after per app (top row before, bottom row after; columns are 390 light, 390 dark, 1440 3D phone light, 1440 dark):
`docs/v10/shell-sheets/{courses,expertise,platforms,reviews,projects,blog,services,contact,settings,journey}.jpg`. Live shots: `docs/morning/*.png` (local only).

### Needs Chetan (new)

- Delete the Google app password "NFCPortfolio" after your passkey (keep "portfolio").
- The iOS 27 Builder licence reads "All Rights Reserved". The site takes values only, with credit. Confirm you're happy with that.
- Check the new shell on a real phone (glass back button, 17 px grey section headers, rounder groups, wider toggle).
- Still open, unchanged: the Apple-style icon pack (`NEXT_PUBLIC_ICON_PACK=original` fallback), the 3D model licence, the Anti-Doom Play Store link, StackUp status, the five unverified reviews and the real-phone checks.

---

## Earlier: v10 run (afternoon): lock screen, Journey, YouTube fallback

Short version: the iOS-style lock screen and the Apple-style Journey are live on nfcportfolio-two.vercel.app (`main` 5cb239c, Vercel Production Ready, :3100 updated). The YouTube widget now keeps the last good video. One real contact message went out and landed in the Inbox. The Google app password wasn't deleted: Google asked for your passkey.

| # | Task | Result |
| --- | --- | --- |
| 1 | Push the unpushed docs commit | Done (04a6384 on `origin/main`). |
| 2 | Lock screen (Part 1) | Done, 8e33c7f. Tall glass clock (Archivo wdth 62, scaleY 1.8, ~28.5% of the screen), battery / GitHub / Pune widgets, flashlight and camera, Substack notification stack with the real mark. Depth effect skipped (would need a second shader pass every frame). |
| 3 | Journey (Part 2) | Done, 4739813. Large title, inset groups, year headers on a hairline rail, push details with edge-swipe back, no emoji, rem type. Facts unchanged and tested word for word. |
| 4 | YouTube widget | Done, 5cb239c. Live feed, else the committed `public/content/youtube-latest.json` (refreshed on each Vercel build). |
| 5 | Delete app password "NFCPortfolio" | **Stopped at the passkey.** myaccount.google.com/apppasswords redirected to a passkey challenge; I closed the tab without touching it. Nothing was deleted or read. |
| 6 | Live checks + contact test | 56/56 checks pass (390x844 and 1440x900, light and dark). Contact: API 200 `{"ok":true}`, "Message sent" pill, and "[chetanpujari.com] v10 live test (from Test)" is in the chetanpujari92@gmail.com Inbox (1:35 PM). |
| 7 | Tests | Full suite on the branch build: 423 passed, 5 failed (the known throttled speed checks, 58–62 ms vs 50 ms, failing since v5), 319 skipped. Lint and typecheck clean. Visual baselines added on purpose: lock light/dark, `#journey`, `#journey/2025`. |

### URLs checked

- https://nfcportfolio-two.vercel.app/ (lock screen, home pages 1 and 2)
- https://nfcportfolio-two.vercel.app/#journey and #journey/2025
- https://nfcportfolio-two.vercel.app/#projects
- https://nfcportfolio-two.vercel.app/#contact (one real send)
- Vercel deployment `nfcportfolio-hjfjh9fc8-chetanpujari5105s-projects.vercel.app` (Ready, 30 s; build log shows the YouTube snapshot refresh)
- https://myaccount.google.com/apppasswords → passkey challenge (stopped)

### Live checks (`node scripts/live-check.mjs`)

| Check | 390 light | 390 dark | 1440 light | 1440 dark |
| --- | --- | --- | --- | --- |
| Lock clock 27–35% of screen, inside it | 28.5% | 28.5% | 28.5% | 28.5% |
| Lock screen: nothing clipped | Pass | Pass | Pass | Pass |
| Substack notification with its mark | 3 cards | 3 cards | 3 cards | 3 cards |
| Unlock | Pass | Pass | Pass | Pass |
| Home pages 1 and 2 paint | Pass | Pass | Pass | Pass |
| GitHub heatmap | 1,022, 236 squares | Pass | Pass | Pass |
| YouTube: latest video | "sidekick launch v3 1080p" | Pass | Pass | Pass |
| Journey: story + 6 milestones, detail pushes | Pass | Pass | Pass | Pass |
| Projects: Anti-Doom and StackUp | Pass | Pass | Pass | Pass |
| No page errors | Pass | Pass | Pass | Pass |

Screenshots: `docs/morning/*-390x844-*.png`, `*-1440x900-*.png` (local only). Before/after: `docs/v10/*.jpg`.

### Needs Chetan (new today)

- Delete the Google app password "NFCPortfolio" after your passkey (keep "portfolio").
- Real-phone check of v10 (lock feel, tap-to-wake, Journey with Larger text).
- Unchanged, still open: the Apple-style icon pack (`NEXT_PUBLIC_ICON_PACK=original` is the safe fallback), the 3D model licence, the Anti-Doom Play Store link, StackUp status, the five unverified reviews, and the real-phone checks. Full list in `docs/progress.md`.

---

# Earlier: morning report (overnight run, 2026-10-29)

Short version (updated after the Gmail switch, d0673ba): the Contact form sends through Gmail SMTP to chetanpujari92@gmail.com. A live test arrived in the Inbox. No domain needed. The heatmap reads GitHub with the `portfolio-heatmap` token. What's left is the decisions under "Needs Chetan".

## Third pass (done: email sends, heatmap on the token)

After you signed in to Resend and approved the GitHub passkey:

| # | Task | Result |
| --- | --- | --- |
| 1 | Resend key + domains | Done. API key `portfolio` (Sending access, all domains) created in team `cpujari12`. Domains: **none added**, so no DNS records to copy; the site uses the test sender `onboarding@resend.dev`. |
| 2 | Vercel env (Production) | Done: `RESEND_API_KEY` (Secret), `CONTACT_TO_EMAIL` = `cpujari12@gmail.com` (the Resend account email from Settings → Team), `GITHUB_TOKEN` (Secret). `CONTACT_FROM_EMAIL` left unset (no verified domain). The same three are in `nfc-portfolio-prod/.env.local` (gitignored, mode 600). Keys went clipboard → file/CLI and were never printed or screenshotted; the clipboard was cleared after. |
| 3 | GitHub token | Done. `portfolio-heatmap`, expires 29 Oct 2027, public repositories (read-only), no permissions. GraphQL test: HTTP 200, 1,016 contributions. |
| 4 | Redeploy + :3100 | One redeploy: `dpl_ARyDWoqt1gRSt8DrCyoav2BL6uBV` is Ready (1 min) and aliased to nfcportfolio-two.vercel.app. :3100 restarted from `nfc-portfolio-prod`, now on `main` 2ff003d (only docs and `.gitignore` changed since 8cdd6a7, so no rebuild). |
| 5 | Live test message | **Sent once.** From the live form at 390x844 (name "Test", subject "Overnight test"): API 200 `{"ok":true}`, the form showed **"Message sent"**. Resend → Emails: to `cpujari12@gmail.com`, **Delivered**, subject "[chetanpujari.com] Overnight test (from Test)". Vercel logs for that request: only the expected warn `[contact] CONTACT_FROM_EMAIL is not set: sending from onboarding@resend.dev…`. On desktop the form sits on the 3D phone and Claude in Chrome couldn't click it, so the send ran in a phone-sized Playwright browser against the live site. |
| 6 | Heatmap | `/api/contributions` → `"source": "github"`, 1,016 contributions (the GraphQL total; the public page gave 1,015 earlier). |

**Important:** messages now go to **cpujari12@gmail.com** (your Resend account), not `chetanpujari92@gmail.com`, which the form shows in "To:". That's a Resend rule for the test sender. To receive mail at `chetanpujari92@gmail.com`, verify a domain in Resend, set `CONTACT_FROM_EMAIL="Chetan Pujari <hello@that-domain>"`, delete `CONTACT_TO_EMAIL` in Vercel and `.env.local`, then redeploy.

## Second pass (morning, after you signed in)

Still blocked on the same two walls, so nothing was created and no Vercel setting changed. The Chrome that Claude controls (the only one connected) has Vercel and GitHub signed in, but **not Resend**.

| # | Task | Result |
| --- | --- | --- |
| 1 | Resend key + domains | **Blocked.** resend.com/domains and /overview redirect to "Log in to Resend" in that Chrome, even after a reload. I didn't click "Log in with Google/GitHub": if your account uses the other one, that would create a second Resend account. So I couldn't read Domains or your account email either. |
| 2 | Vercel env vars | **Not done** (nothing to put in them yet). `vercel env ls production` for `nfcportfolio` still shows no variables. |
| 3 | GitHub token `portfolio-heatmap` | **Blocked.** github.com/settings/personal-access-tokens/new shows "Confirm access" → "Use passkey" again. I left that tab open on that screen. |
| 4 | Redeploy + restart :3100 | **Skipped:** no env var or code changed. Production (`nfcportfolio-essptao5j…`, Ready) already runs the latest `main`, and :3100 answers 200 from `nfc-portfolio-prod` (8cdd6a7; 7abe438 only changed docs). |
| 5 | Live contact test | **Not sent.** Without `RESEND_API_KEY` the API answers 503 `unavailable` and the form shows "Email isn't set up…" and keeps the text (checked in all 4 runs). No email was sent. |
| 6 | Heatmap source | `/api/contributions` returns `"source": "github"` (not `snapshot`), 1,015 contributions. Without a token that's the public contributions page, not GraphQL. |
| 7 | Live Playwright (390x844, 1440x900, light + dark) | **No regressions.** 14 icons on page 1, nothing unpainted on either page, heatmap visible in 4–73 ms (117 squares), stack swipe → "2 of 8: UI/UX Design" and stays on page 2, Projects shows Anti-Doom and StackUp. The only console error is the expected contact 503. |

**One external change, not a regression:** the YouTube widget showed "Latest video" in the first run and the channel card in the other three. YouTube's channel RSS (`youtube.com/feeds/videos.xml?channel_id=…`) answers **404 right now for every channel** (also Google Developers'), so when Vercel rebuilt the cached home page it got no video and fell back to the channel card, as designed. It returns by itself when YouTube's feed comes back; the cache refreshes every 6 hours. Possible follow-up: keep the last good video (a committed snapshot, like the heatmap) instead of falling back to the channel card.

### To finish it yourself (about 5 minutes)

1. In the **same Chrome window Claude uses**, open resend.com and sign in (the way you created the account).
2. API Keys → Create API key → name `portfolio`, permission **Sending access** → copy it.
3. Domains: if one is **Verified**, use `CONTACT_FROM_EMAIL="Chetan Pujari <hello@that-domain>"` and leave `CONTACT_TO_EMAIL` unset (mail then goes to `chetanpujari92@gmail.com` from `content/profile.ts`). If none is verified, leave `CONTACT_FROM_EMAIL` unset and set `CONTACT_TO_EMAIL` to the email you sign in to Resend with (the test sender only delivers there).
4. Vercel → nfcportfolio → Settings → Environment Variables → Production: add `RESEND_API_KEY` (+ the email variable from step 3). Then Deployments → latest → Redeploy.
5. GitHub: on the open "Confirm access" tab, press **Use passkey**, then create the `portfolio-heatmap` token (1 year, Public repositories, no permissions) and add it as `GITHUB_TOKEN` (Production). Add it before the redeploy in step 4 to redeploy only once.
6. Send yourself a message from https://nfcportfolio-two.vercel.app/#contact. You should see "Message sent". If not, Vercel → Logs → filter `[contact]`: that line names the setting to fix.
7. Optional, for local :3100: put the same lines in `nfc-portfolio-prod/.env.local`, then restart `next start -p 3100` there.

Or sign in to Resend, pass the passkey, and ask me to run this again. I'll then do steps 2–7 without showing the keys.

## What I did (overnight)

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

1. ~~Resend~~ Done (third pass). **Still open:** verify a domain in Resend so mail reaches `chetanpujari92@gmail.com` and can come from your own address. Resend → Domains → Add domain shows the exact MX/TXT (SPF) records for a `send` subdomain and a DKIM TXT `resend._domainkey`. Add them at your DNS provider, Verify, then set `CONTACT_FROM_EMAIL`, delete `CONTACT_TO_EMAIL`, and redeploy.
2. ~~GitHub token~~ Done (third pass). It expires 29 Oct 2027; renew it before then.
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
