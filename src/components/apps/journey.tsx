"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { profile } from "@content/profile";
import { story } from "@content/story";
import { timeline } from "@content/timeline";
import { AppHeader, AppScreen, PushView, useLastValue } from "@/components/ui/app-shell";
import { blurOf } from "@/lib/placeholders";
import { openApp } from "@/lib/router";
import { useOS } from "@/lib/store";
import { cn } from "@/lib/utils";

/*
 * Journey, laid out like an Apple app: a large title, inset-grouped sections 12 px apart, one
 * system type scale (title 17/600, secondary 15/400 grey, caption 13), and a timeline whose years
 * are its section headers, strung on a hairline rail. Rows push a detail view (swipe from the left
 * edge to go back). Every word comes from content/ (profile, story, timeline); none is written here.
 * Type is in rem, so Settings → Larger text scales all of it.
 */

/* ───────────────────────── Glyphs: original, drawn on a 24 grid like SF Symbols ───────────────────────── */

const GLYPHS = {
  play: <path fillRule="evenodd" stroke="none" d="M12 3.6a8.4 8.4 0 1 1 0 16.8 8.4 8.4 0 0 1 0-16.8Zm-1.9 5v6.8l5.6-3.4Z" />,
  stack: (
    <>
      <path d="m12 4 8.5 4.3L12 12.6 3.5 8.3Z" />
      <path d="m4.8 11.4 7.2 3.7 7.2-3.7M4.8 14.9l7.2 3.7 7.2-3.7" fill="none" />
    </>
  ),
  easel: (
    <>
      <path d="M4.5 5h15v10h-15Z" />
      <path d="M12 3.5V5m-3.5 10L7 20.5M15.5 15l1.5 5.5" fill="none" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.6C10.2 5.3 7.7 4.8 4 5v13c3.7-.2 6.2.3 8 1.6Z" />
      <path d="M12 6.6c1.8-1.3 4.3-1.8 8-1.6v13c-3.7-.2-6.2.3-8 1.6Z" />
    </>
  ),
  mic: (
    <>
      <path d="M9.2 6.2a2.8 2.8 0 0 1 5.6 0v5.3a2.8 2.8 0 0 1-5.6 0Z" />
      <path d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8v3.4m-3 0h6" fill="none" />
    </>
  ),
  sparkle: (
    <>
      <path d="M10 4.5c.6 3.6 2 5 5.6 5.6-3.6.6-5 2-5.6 5.6-.6-3.6-2-5-5.6-5.6 3.6-.6 5-2 5.6-5.6Z" />
      <path d="M17.2 13.6c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7Z" />
    </>
  ),
  cap: (
    <>
      <path d="m12 5 9.5 4.6L12 14.2 2.5 9.6Z" />
      <path d="M6.5 11.6v3.7c1.4 1.3 3.3 2 5.5 2s4.1-.7 5.5-2v-3.7M20 10.4v5" fill="none" />
    </>
  ),
  star: <path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6Z" />,
  quote: <path d="M5 8.5A2.5 2.5 0 0 1 7.5 6H10v5H7.6c0 1.6.8 2.7 2.4 3.2V17c-3.2-.5-5-2.9-5-6.4Zm9 0A2.5 2.5 0 0 1 16.5 6H19v5h-2.4c0 1.6.8 2.7 2.4 3.2V17c-3.2-.5-5-2.9-5-6.4Z" />,
} satisfies Record<string, ReactNode>;

type GlyphName = keyof typeof GLYPHS;

/** iOS 27 accents (lib/ios-tokens.ts), one flat fill per tile as in Settings; they shift with dark mode */
const TINT = {
  blue: "var(--ios-blue)",
  indigo: "var(--ios-indigo)",
  orange: "var(--ios-orange)",
  green: "var(--ios-green)",
  red: "var(--ios-red)",
  purple: "var(--ios-purple)",
  teal: "var(--ios-teal)",
  gray: "var(--ios-gray)",
};

function Tile({ glyph, tint, size = 30, rail }: { glyph: GlyphName; tint: string; size?: number; rail?: boolean }) {
  return (
    <span
      aria-hidden
      data-rail-tile={rail ? "" : undefined}
      className="squircle relative z-2 grid shrink-0 place-items-center text-white"
      style={{ width: size, height: size, background: tint }}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[66%]"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[glyph]}
      </svg>
    </span>
  );
}

/* ───────────────────────── Content, shaped (never reworded) ───────────────────────── */

const noEmoji = (s: string) => s.replace(/\s*\p{Extended_Pictographic}️?/gu, "");
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One look per milestone, in timeline order. */
const LOOKS: { glyph: GlyphName; tint: string }[] = [
  { glyph: "play", tint: TINT.red },
  { glyph: "stack", tint: TINT.indigo },
  { glyph: "easel", tint: TINT.orange },
  { glyph: "book", tint: TINT.blue },
  { glyph: "mic", tint: TINT.teal },
  { glyph: "sparkle", tint: TINT.purple },
];

/** A milestone's sentence, split at its first semicolon: what happened, then what came with it. */
const MILESTONES = timeline.map((t, i) => {
  const [title, ...rest] = t.text.split(";");
  return {
    year: t.year,
    id: String(t.year),
    title: title.trim(),
    detail: rest.length ? capitalise(rest.join(";").trim()) : null,
    ...LOOKS[i % LOOKS.length],
  };
});
type Milestone = (typeof MILESTONES)[number];

const STORY = story.map(noEmoji);

/* ───────────────────────── Building blocks ───────────────────────── */

function Section({ header, footer, children, className }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("mb-3", className)}>
      {header && <h2 className="px-4 pt-2.5 pb-2.5 text-ios-headline font-semibold text-app-muted">{header}</h2>}
      <div className="overflow-hidden rounded-ios-xxl bg-app-group">{children}</div>
      {footer && <p className="mt-2 px-4 text-ios-footnote leading-[1rem] text-app-muted">{footer}</p>}
    </section>
  );
}

/** A grouped row (the kit's Tall row): tile, Headline title (17/600) and Subheadline secondary (15 grey); a chevron only when it pushes. */
function Row({
  leading,
  title,
  secondary,
  onPress,
  label,
  data,
}: {
  leading?: ReactNode;
  title: ReactNode;
  secondary?: ReactNode;
  onPress?: () => void;
  label?: string;
  data?: Record<string, string>;
}) {
  const body = (
    <>
      {leading}
      <span className="min-w-0 flex-1 py-3">
        <span className="block text-ios-headline font-semibold">{title}</span>
        {secondary && <span className="block text-ios-subheadline text-app-muted">{secondary}</span>}
      </span>
      {onPress && <ChevronRight aria-hidden className="size-4 shrink-0 text-ios-label-tertiary" strokeWidth={2.6} />}
    </>
  );
  const classes = "relative flex min-h-[3.25rem] w-full items-center gap-3 px-4 text-left";
  if (!onPress) return <div className={classes}>{body}</div>;
  return (
    <button type="button" onClick={onPress} aria-label={label} {...data} className={cn(classes, "active:bg-ios-fill-tertiary")}>
      {body}
    </button>
  );
}

/** The hairline between rows, inset to where the text starts (past the tile) */
const Hairline = ({ inset = 58 }: { inset?: number }) => (
  <span aria-hidden className="block h-[0.5px] bg-app-divider" style={{ marginLeft: inset }} />
);

/* ───────────────────────── The timeline ───────────────────────── */

/** Tile centre from the card's left edge: 16 px inset + half a 30 px tile. The rail runs through it. */
const RAIL_X = 31;

/**
 * Years as section headers, each milestone in its own inset card, all strung on one hairline that
 * runs from the first year to the last tile: under the tiles, over the cards, past each year's node.
 */
function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState<{ top: number; height: number } | null>(null);

  // The rail spans the first year's node to the last tile; measured, since rows grow with the text size
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const tiles = el.querySelectorAll<HTMLElement>("[data-rail-tile]");
      const first = el.querySelector<HTMLElement>("[data-rail-node]");
      if (tiles.length < 2 || !first) return setRail(null);
      const centre = (t: HTMLElement) => {
        let y = t.offsetHeight / 2;
        for (let n: HTMLElement | null = t; n && n !== el; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
        return y;
      };
      const top = centre(first);
      setRail({ top, height: centre(tiles[tiles.length - 1]) - top });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      {rail && <span aria-hidden className="absolute z-1 w-px bg-app-divider" style={{ left: RAIL_X - 0.5, ...rail }} />}
      <ol>
        {MILESTONES.map((m) => (
          <li key={m.id} className="mb-3">
            <h3 className="relative flex items-center pt-2.5 pb-2.5 pl-[58px] text-ios-headline font-semibold text-app-muted tabular-nums">
              <span aria-hidden data-rail-node className="absolute z-1 size-[7px] rounded-full bg-[color-mix(in_oklab,var(--app-muted)_60%,var(--app-background))]" style={{ left: RAIL_X - 3.5 }} />
              {m.year}
            </h3>
            <div className="overflow-hidden rounded-ios-xxl bg-app-group">
              <Row
                leading={<Tile glyph={m.glyph} tint={m.tint} rail />}
                title={m.title}
                secondary={m.detail}
                onPress={() => openApp("journey", m.id)}
                label={`${m.year}: ${m.title}`}
                data={{ "data-journey-row": m.id }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ───────────────────────── Detail views ───────────────────────── */

const HIGHLIGHT_PLACE = profile.highlight.title.split(" (")[0];

function MilestoneDetail({ m }: { m: Milestone }) {
  const index = MILESTONES.indexOf(m);
  // Facts elsewhere in the content that belong to this year: the story's own paragraph about it,
  // and the highlight when this milestone is where it happened
  const told = STORY.filter((p) => p.includes(String(m.year)));
  const highlight = m.title.includes(HIGHLIGHT_PLACE) ? profile.highlight : null;
  return (
    <AppScreen>
      <AppHeader title={m.id} backLabel="Back to Journey" subtitle={`Milestone ${index + 1} of ${MILESTONES.length}`} />
      <Section>
        <div className="flex flex-col items-center px-4 pt-6 pb-5 text-center">
          <Tile glyph={m.glyph} tint={m.tint} size={60} />
          <p className="mt-3 text-[1.375rem] leading-tight font-bold tracking-[-0.015em]">{m.title}</p>
          {m.detail && <p className="mt-1.5 text-[0.9375rem] leading-[1.4] text-app-muted">{m.detail}</p>}
        </div>
      </Section>
      {highlight && (
        <Section header="Highlight">
          <Row leading={<Tile glyph="star" tint={TINT.orange} />} title={highlight.title} secondary={highlight.text} />
        </Section>
      )}
      {told.length > 0 && (
        <Section header="From my story">
          <div className="space-y-3 px-4 py-3.5 text-[1.0625rem] leading-[1.45]">
            {told.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>
      )}
    </AppScreen>
  );
}

function StoryDetail() {
  return (
    <AppScreen>
      <AppHeader title="My Story" backLabel="Back to Journey" />
      <Section>
        <div className="space-y-4 px-4 py-4 text-[1.0625rem] leading-[1.5]">
          {STORY.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Section>
    </AppScreen>
  );
}

function Detail({ id }: { id: string }) {
  if (id === "story") return <StoryDetail />;
  const m = MILESTONES.find((x) => x.id === id);
  return m ? <MilestoneDetail m={m} /> : null;
}

/* ───────────────────────── The app ───────────────────────── */

export default function JourneyApp() {
  const sub = useOS((s) => (s.route.app === "journey" ? s.route.sub : null));
  const shown = useLastValue(sub);

  return (
    <>
      <AppScreen>
        <AppHeader title="Journey" subtitle="From curiosity to 400K students." />

        <Section>
          <div className="flex items-center gap-3.5 px-4 py-3.5">
            <Image
              src={profile.avatar}
              {...blurOf(profile.avatar)}
              alt={profile.name}
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-full object-cover"
            />
            <span className="min-w-0">
              <span className="block text-[1.25rem] leading-tight font-semibold tracking-[-0.015em]">{profile.name}</span>
              <span className="mt-0.5 block text-[0.9375rem] leading-snug text-app-muted">
                {profile.role} · {profile.location}
              </span>
            </span>
          </div>
          <Hairline inset={16} />
          <p className="px-4 py-2.5 text-ios-footnote text-app-muted">{profile.badges.join(" · ")}</p>
        </Section>

        <Section header="About">
          <Row
            leading={<Tile glyph="quote" tint={TINT.gray} />}
            title="My Story"
            secondary={<span className="line-clamp-2">{STORY[0]}</span>}
            onPress={() => openApp("journey", "story")}
            label="My Story"
            data={{ "data-journey-row": "story" }}
          />
        </Section>

        <h2 className="mt-5 px-4 text-[1.375rem] leading-tight font-bold tracking-[-0.015em]">
          Roots to leaves
        </h2>
        <Timeline />

        <Section header="Education">
          <Row leading={<Tile glyph="cap" tint={TINT.blue} />} title={profile.education} secondary="Engineering" />
        </Section>

        <Section header="Highlight">
          <Row leading={<Tile glyph="star" tint={TINT.orange} />} title={profile.highlight.title} secondary={profile.highlight.text} />
        </Section>
      </AppScreen>

      <PushView open={!!sub} label="Journey details">
        {shown && <Detail id={shown} />}
      </PushView>
    </>
  );
}
