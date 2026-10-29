"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import * as m from "motion/react-m";

import { profile } from "@content/profile";
import { loadContributions, recent } from "@/lib/contributions";
import { cn } from "@/lib/utils";

import { BrandGlyph, BrandTile } from "./BrandIcon";
import { github, substack } from "./brand-marks";
import type { FeedPost } from "./server-data";

/* Lock-screen pieces: the round widgets under the clock, the corner buttons and the notification
   stack. Taps reach them through the lock screen's own gesture (it captures the pointer), by their
   `data-lock-action`; their buttons' onClick only handles the keyboard. */

/** A round lock widget: a ring (0–1) around a small centre, on the lock screen's glass. */
function RingWidget({ label, value, children }: { label: string; value: number | null; children: ReactNode }) {
  const r = 21;
  const c = 2 * Math.PI * r;
  return (
    <span role="img" aria-label={label} data-lock-item className="lock-widget">
      <svg viewBox="0 0 48 48" aria-hidden className="absolute inset-[7%] size-[86%] -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(255 255 255 / 0.22)" strokeWidth="3.4" />
        {value !== null && (
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0.001, Math.min(1, value)) * c} ${c}`}
          />
        )}
      </svg>
      <span aria-hidden className="relative flex flex-col items-center leading-none">
        {children}
      </span>
    </span>
  );
}

type BatteryManager = { level: number; charging: boolean; addEventListener: (t: string, f: () => void) => void; removeEventListener: (t: string, f: () => void) => void };

/** This device's battery where the browser shares it (Chromium); otherwise the ring alone. */
function BatteryWidget() {
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  useEffect(() => {
    const get = (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery;
    if (!get) return;
    let manager: BatteryManager | null = null;
    const read = () => manager && setBattery({ level: manager.level, charging: manager.charging });
    get.call(navigator).then((b) => {
      manager = b;
      read();
      b.addEventListener("levelchange", read);
      b.addEventListener("chargingchange", read);
    }, () => {});
    return () => {
      manager?.removeEventListener("levelchange", read);
      manager?.removeEventListener("chargingchange", read);
    };
  }, []);
  const pct = battery ? Math.round(battery.level * 100) : null;
  return (
    <RingWidget label={pct === null ? "Battery" : `Battery ${pct}%${battery?.charging ? ", charging" : ""}`} value={battery?.level ?? null}>
      <svg viewBox="0 0 24 24" className="mb-[6%] size-[calc(var(--lw)*0.22)]" fill="currentColor">
        {battery?.charging ? (
          <path d="M13.2 2.5 6.4 13.1h4.7l-1 8.4 7.5-11.3h-4.9l.5-7.7Z" />
        ) : (
          <path d="M7 4.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2Zm0 1.6a.4.4 0 0 0-.4.4v11c0 .2.2.4.4.4h10c.2 0 .4-.2.4-.4v-11a.4.4 0 0 0-.4-.4Zm3.3 1.2h3.4v1.2h-3.4Z" />
        )}
      </svg>
      <span className="text-[calc(var(--lw)*0.27)] font-semibold tabular-nums">{pct ?? "–"}</span>
    </RingWidget>
  );
}

/** GitHub this week: the ring fills with active days (of 7), the centre counts contributions. */
function ContributionsWidget() {
  const [week, setWeek] = useState<{ count: number; active: number } | null>(null);
  useEffect(() => {
    let live = true;
    void loadContributions().then((c) => live && c && setWeek(recent(c.days)));
    return () => {
      live = false;
    };
  }, []);
  return (
    <RingWidget
      label={week ? `GitHub: ${week.count} contributions on ${week.active} of the last 7 days` : "GitHub contributions"}
      value={week ? week.active / 7 : null}
    >
      <BrandGlyph mark={github} className="mb-[6%] size-[calc(var(--lw)*0.2)]" />
      <span className="text-[calc(var(--lw)*0.27)] font-semibold tabular-nums">{week?.count ?? "–"}</span>
    </RingWidget>
  );
}

const CITY = profile.location.split(",")[0];

/** A small analog clock on Chetan's time (Pune, IST), whatever the visitor's time zone. */
function CityClock({ now }: { now: Date | null }) {
  const t = now && new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const min = t ? t.getMinutes() : 0;
  const hour = t ? (t.getHours() % 12) + min / 60 : 0;
  const label = t ? `${CITY}: ${t.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : CITY;
  return (
    <span role="img" aria-label={label} data-lock-item className="lock-widget">
      <svg viewBox="0 0 48 48" aria-hidden className="absolute inset-[7%] size-[86%]">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="24" y1="4.6" x2="24" y2={i % 3 ? 6.4 : 7.6} stroke="rgb(255 255 255 / 0.55)" strokeWidth="1.3" strokeLinecap="round" transform={`rotate(${i * 30} 24 24)`} />
        ))}
        <text x="24" y="17.5" textAnchor="middle" fill="rgb(255 255 255 / 0.7)" fontSize="5.6" fontWeight="600" letterSpacing="0.3">
          {CITY.slice(0, 3).toUpperCase()}
        </text>
        {t && (
          <g stroke="currentColor" strokeLinecap="round">
            <line x1="24" y1="24" x2="24" y2="14.5" strokeWidth="2.6" transform={`rotate(${hour * 30} 24 24)`} />
            <line x1="24" y1="24" x2="24" y2="9.5" strokeWidth="1.8" transform={`rotate(${min * 6} 24 24)`} />
          </g>
        )}
        <circle cx="24" cy="24" r="2.1" fill="currentColor" />
        <circle cx="24" cy="24" r="0.9" fill="var(--accent)" />
      </svg>
    </span>
  );
}

export function LockWidgets({ now, fade }: { now: Date | null; fade: MotionValue<number> }) {
  return (
    <m.div style={{ opacity: fade }} className="mt-[2.6cqh] flex items-center gap-[3.6cqw] land:hidden">
      <BatteryWidget />
      <ContributionsWidget />
      <CityClock now={now} />
    </m.div>
  );
}

/* ───────────────────────── Corner buttons ───────────────────────── */

export function TorchGlyph({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[46%]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M7.5 2.8h9v3l-2 3.4v11a1.6 1.6 0 0 1-1.6 1.6h-1.8a1.6 1.6 0 0 1-1.6-1.6v-11l-2-3.4Z" fill={on ? "currentColor" : "none"} />
      <path d="M7.5 5.8h9" />
      <circle cx="12" cy="13.2" r="1.25" fill={on ? "var(--lock-btn-bg-on)" : "currentColor"} stroke="none" />
    </svg>
  );
}

export function CameraGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[46%]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M3.4 8.6a2 2 0 0 1 2-2h2.3l1.5-2.1h5.6l1.5 2.1h2.3a2 2 0 0 1 2 2v8.8a2 2 0 0 1-2 2H5.4a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="12.8" r="3.5" />
    </svg>
  );
}

/* ───────────────────────── Notification stack ───────────────────────── */

/** "now" for the newest; then "3d ago", "2w ago". */
function ago(post: FeedPost, newest: boolean, now: Date | null) {
  if (newest || !now) return "now";
  const days = Math.max(0, Math.round((now.getTime() - new Date(post.date).getTime()) / 86_400_000));
  if (!Number.isFinite(days)) return "";
  if (days < 1) return "today";
  if (days < 7) return `${days}d ago`;
  if (days < 60) return `${Math.round(days / 7)}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

/** Peek of each card under the front one, collapsed (px). */
const PEEK = 8;

/**
 * Up to three Substack posts as iOS notifications. Collapsed: the newest in front, the others
 * peeking out beneath it. A tap spreads them (upward, from the bottom like iOS); a tap on a card
 * then opens that post. `collapse` runs 1 (stacked) → 0 (spread) and is driven by the lock screen.
 */
export function NotificationStack({
  posts,
  collapse,
  expanded,
  now,
  onKeyOpen,
  onKeyExpand,
}: {
  posts: FeedPost[];
  collapse: MotionValue<number>;
  expanded: boolean;
  now: Date | null;
  onKeyOpen: (i: number, el: HTMLElement) => void;
  onKeyExpand: () => void;
}) {
  const cards = useRef<(HTMLButtonElement | null)[]>([]);

  // Each card's offset from its spread place to its stacked place, from the measured heights.
  // Written straight to the cards' styles: they mount before the motion features load.
  useLayoutEffect(() => {
    const place = () => {
      const els = cards.current.slice(0, posts.length).filter(Boolean) as HTMLElement[];
      if (!els.length) return;
      const bottoms = els.map((el) => el.offsetTop + el.offsetHeight);
      const total = bottoms[bottoms.length - 1];
      const n = els.length;
      const c = collapse.get();
      els.forEach((el, i) => {
        // Behind the front card, each one smaller: its bottom edge peeks out by PEEK
        const stacked = total - PEEK * (n - 1 - i);
        el.style.transform = `translateY(${c * (stacked - bottoms[i])}px) scale(${1 - c * 0.05 * i})`;
        el.style.opacity = String(i === 0 ? 1 : 1 - c * (0.15 + 0.2 * i));
      });
    };
    place();
    const unsubscribe = collapse.on("change", place);
    const observer = new ResizeObserver(place);
    cards.current.forEach((el) => el && observer.observe(el));
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [collapse, posts.length]);

  if (!posts.length) return null;
  const many = posts.length > 1;
  return (
    <div data-lock-stack className="pointer-events-none absolute inset-x-[3.6cqw] bottom-[calc(8.4cqh+var(--lb)/2+2.2cqh)] flex flex-col gap-2">
      {posts.map((post, i) => {
        const action = many && !expanded ? "stack" : `post:${i}`;
        return (
          <button
            key={post.url}
            ref={(el) => {
              cards.current[i] = el;
            }}
            type="button"
            data-lock-item={i === 0 ? "" : undefined}
            data-lock-action={action}
            aria-label={
              many && !expanded
                ? `${posts.length} notifications from Substack. Newest: ${post.title}. Show all`
                : `Substack: ${post.title}. Open in Blog`
            }
            aria-hidden={!expanded && i > 0 ? true : undefined}
            tabIndex={!expanded && i > 0 ? -1 : undefined}
            onClick={(e) => {
              if (e.detail !== 0) return;
              if (action === "stack") onKeyExpand();
              else onKeyOpen(i, e.currentTarget);
            }}
            style={{ zIndex: 3 - i, transformOrigin: "50% 100%" }}
            className={cn("lock-notification pointer-events-auto", "[&>*]:transition-opacity [&>*]:duration-200", i > 0 && !expanded && "[&>*]:opacity-0")}
          >
            <BrandTile mark={substack} className="size-[2.375rem]" />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[0.75rem] font-semibold tracking-[0.06em] uppercase opacity-60">Substack</span>
                <span className="text-[0.8125rem] opacity-60">{ago(post, i === 0, now)}</span>
              </span>
              <span className="block truncate text-[0.9375rem] leading-tight font-semibold">{post.title}</span>
              <span className="block truncate text-[0.9375rem] leading-tight opacity-80">{post.subtitle || "New post"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
