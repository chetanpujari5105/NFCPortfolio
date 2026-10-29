# Morning report (overnight run, 2026-10-29)

Short version (updated after the third pass): the Contact form now sends. A live test was Delivered to cpujari12@gmail.com, your Resend account, because no domain is verified yet. The heatmap reads GitHub with the `portfolio-heatmap` token. What's left for you: verify a domain in Resend so mail reaches chetanpujari92@gmail.com, plus the decisions under "Needs Chetan".

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
