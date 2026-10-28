import { profile } from "@content/profile";
import { ContactSchema, fieldErrorsOf, type ContactResult } from "@/lib/contact";
import { clientIp, rateLimit, recordHit } from "@/lib/rate-limit";

/*
 * Contact form → one email via Resend's REST API. Sent From CONTACT_FROM_EMAIL (never the
 * visitor), To the owner, Reply-To the visitor. Every way it can't send is logged with the
 * setting to fix; the visitor gets a reason the form can act on (see ContactResult).
 */

/** Resend's shared test sender: only delivers to the Resend account owner's own address. */
const TEST_SENDER = "Pocket Portfolio <onboarding@resend.dev>";
/** `hello@domain.com` or `Name <hello@domain.com>` */
const SENDER = /^(?:[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+|[^<>\r\n]*<[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>)$/;
/** Attempts that reach Resend per IP (burst), and messages actually sent per IP (hourly). */
const ATTEMPTS = { limit: 5, windowMs: 10 * 60 * 1000 };
const SENT = { limit: 3, windowMs: 60 * 60 * 1000 };
const MAX_BODY = 20_000;

const json = (body: ContactResult, status: number, headers?: HeadersInit) => Response.json(body, { status, headers });
const log = (level: "warn" | "error", message: string) => console[level](`[contact] ${message}`);

let warnedTestSender = false;

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
/** Control characters out (line breaks kept only where asked); no header or markup tricks survive. */
function clean(text: string, multiline = false) {
  const out = text.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0009\u000B-\u001F\u007F\u2028\u2029]/g, (c) => (c === "\t" ? " " : ""));
  return multiline ? out.trim() : out.replace(/\s+/g, " ").trim();
}

/** Sender, recipient and key, or why there are none. */
function settings() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    log(
      "error",
      "RESEND_API_KEY is not set, so messages can't be sent and the form offers \"email me directly\". " +
        "Create a key at resend.com/api-keys and add it to Vercel → Project → Settings → Environment Variables (Production), then redeploy.",
    );
    return null;
  }
  const configured = process.env.CONTACT_FROM_EMAIL?.trim();
  if (configured && !SENDER.test(configured)) {
    log("error", `CONTACT_FROM_EMAIL "${configured}" isn't an address Resend accepts. Use "hello@your-domain.com" or "Name <hello@your-domain.com>".`);
    return null;
  }
  if (!configured && !warnedTestSender) {
    warnedTestSender = true;
    log(
      "warn",
      "CONTACT_FROM_EMAIL is not set: sending from onboarding@resend.dev, which Resend only delivers to the Resend account owner's own address. " +
        'Verify a domain at resend.com/domains and set CONTACT_FROM_EMAIL="Name <hello@your-domain.com>".',
    );
  }
  return {
    key,
    from: configured || TEST_SENDER,
    to: process.env.CONTACT_TO_EMAIL?.trim() || profile.email,
    api: (process.env.RESEND_API_URL || "https://api.resend.com").replace(/\/+$/, ""),
  };
}

/** What to fix when Resend turns the settings down (400/401/403/422). */
function hint(status: number, message: string, testSender: boolean) {
  if (status === 401) return "Check RESEND_API_KEY: copy a fresh key from resend.com/api-keys.";
  if (status === 403 && (testSender || /testing emails/i.test(message)))
    return "The test sender onboarding@resend.dev only delivers to the Resend account owner. Verify a domain at resend.com/domains and set CONTACT_FROM_EMAIL to an address on it.";
  if (status === 403) return "Verify the domain in CONTACT_FROM_EMAIL at resend.com/domains (or use a key with sending access).";
  return "Check CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL.";
}

export async function POST(request: Request) {
  // Only this site's own pages may post (a page elsewhere can't use the form as a relay)
  const origin = request.headers.get("origin");
  if (origin) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    let from = "";
    try {
      from = new URL(origin).host;
    } catch {}
    if (from !== host) return json({ ok: false, reason: "forbidden" }, 403);
  }
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return json({ ok: false, reason: "invalid", fieldErrors: {} }, 413);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "invalid", fieldErrors: {} }, 400);
  }

  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    // A filled honeypot looks like success to the bot and sends nothing.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) return json({ ok: true }, 200);
    return json({ ok: false, reason: "invalid", fieldErrors: fieldErrorsOf(parsed.error) }, 400);
  }

  const config = settings();
  if (!config) return json({ ok: false, reason: "unavailable", email: profile.email }, 503);

  const ip = clientIp(request);
  const limited = [
    rateLimit(`contact:sent:${ip}`, SENT.limit, SENT.windowMs, { record: false }),
    rateLimit(`contact:try:${ip}`, ATTEMPTS.limit, ATTEMPTS.windowMs),
  ].find((r) => !r.ok);
  if (limited && !limited.ok)
    return json({ ok: false, reason: "rate-limited", email: profile.email, retryAfter: limited.retryAfter }, 429, {
      "Retry-After": String(limited.retryAfter),
    });

  const name = clean(parsed.data.name);
  const subject = clean(parsed.data.subject);
  const message = clean(parsed.data.message, true);
  const email = parsed.data.email;
  const testSender = config.from === TEST_SENDER;

  let res: Response;
  try {
    res = await fetch(`${config.api}/emails`, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: config.from,
        to: [config.to],
        reply_to: email,
        subject: `[chetanpujari.com] ${subject} (from ${name})`.slice(0, 250),
        text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}\n\n(Reply to this email to answer ${name}.)`,
        html:
          `<p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>` +
          `<p style="margin:0 0 16px"><strong>Subject:</strong> ${escapeHtml(subject)}</p>` +
          `<p style="margin:0 0 16px;white-space:pre-wrap">${escapeHtml(message)}</p>` +
          `<p style="margin:0;color:#777;font-size:12px">Reply to this email to answer ${escapeHtml(name)}.</p>`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    log("error", `Couldn't reach Resend (${error instanceof Error ? error.name : "error"}). The visitor can retry.`);
    return json({ ok: false, reason: "failed", email: profile.email }, 502);
  }

  if (res.ok) {
    recordHit(`contact:sent:${ip}`);
    return json({ ok: true }, 200);
  }
  const detail = (await res.json().catch(() => null)) as { message?: string; name?: string } | null;
  const said = `${res.status}${detail?.name ? ` ${detail.name}` : ""}: ${detail?.message ?? res.statusText}`;
  if ([400, 401, 403, 422].includes(res.status)) {
    // The settings, not the visitor: retrying won't help, so the form offers email instead
    log("error", `Resend refused the email (${said}). ${hint(res.status, detail?.message ?? "", testSender)}`);
    return json({ ok: false, reason: "unavailable", email: profile.email }, 503);
  }
  log("error", `Resend couldn't send right now (${said}). The visitor can retry.`);
  return json({ ok: false, reason: "failed", email: profile.email }, 502);
}
