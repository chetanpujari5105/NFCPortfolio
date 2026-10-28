"use client";

import dynamic from "next/dynamic";
import { memo, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import { useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import * as m from "motion/react-m";
import { useDrag } from "@use-gesture/react";

import { startedIn } from "@/lib/gesture";
import { folderId, isFolder, isWidget, TILES, widgetId, type HomeGeometry, type Placed } from "@/lib/home";
import {
  animateTo,
  HOME_SCALE_OPEN,
  haptic,
  homePagerX,
  launchProgress,
  project,
  rubberBand,
  rubberClamp,
  searchProgress,
  useRecede,
  withVelocity,
} from "@/lib/motion";
import { openFolder } from "@/lib/router";
import { prefersReducedMotion, useOS } from "@/lib/store";

import { AppIcon } from "./AppIcon";
import { BrandGlyph } from "./BrandIcon";
import { Glyph } from "./icons";
import { ImpactWidget } from "./ImpactWidget";
import { HOME_MARKS } from "./social-icons";
import { useHomeLayout } from "./use-home-layout";
import { WorkWidget } from "./WorkWidget";

// The other widgets start off page 1: they (and next/image) load right after hydration
const LazyWidget = dynamic(() => import("./HomeWidgets").then((mod) => mod.HomeWidget), {
  ssr: false,
  loading: () => <span aria-hidden className="block size-full widget-r bg-white/10" />,
});

const LONG_PRESS_MS = 500;
/** Pull this far (px) to fully open Search. */
const SEARCH_PULL = 140;

/** A folder's face: up to nine of its apps in a 3×3 grid on frosted glass. */
function FolderTile({ items }: { items: string[] }) {
  return (
    <span className="icon-content grid size-full grid-cols-3 content-start gap-[8%] p-[15%]">
      {items.slice(0, 9).map((id) => {
        const item = TILES[id];
        if (!item) return null;
        const mark = item.brand ? HOME_MARKS[item.brand] : undefined;
        return mark ? (
          <span key={id} className="squircle grid aspect-square place-items-center" style={{ background: mark.tile.bg, color: mark.tile.fg }}>
            <BrandGlyph mark={mark} className="size-[58%]" />
          </span>
        ) : (
          <span
            key={id}
            className="squircle grid aspect-square place-items-center text-white"
            style={{ background: `linear-gradient(170deg, ${item.colors[0]}, ${item.colors[1]})` }}
          >
            <Glyph name={item.icon} className="size-[60%]" />
          </span>
        );
      })}
    </span>
  );
}

/** One grid or dock entry: an app or link, a folder, or (grid only) a widget. */
export function HomeEntry({ entry, showLabel = true }: { entry: string; showLabel?: boolean }) {
  const folder = useOS((s) => (isFolder(entry) ? s.home.folders[folderId(entry)] : undefined));
  if (isWidget(entry)) {
    const id = widgetId(entry);
    if (id === "impact") return <ImpactWidget />;
    if (id === "work") return <WorkWidget />;
    return <LazyWidget id={id} />;
  }
  if (folder) {
    const id = folderId(entry);
    return (
      <AppIcon
        item={{ id: entry, label: folder.name, icon: "folder", colors: ["rgb(255 255 255 / 0.28)", "rgb(255 255 255 / 0.16)"] }}
        tile={<FolderTile items={folder.items} />}
        tileKey={entry}
        className="icon-folder"
        showLabel={showLabel}
        onOpen={() => openFolder(id)}
      />
    );
  }
  const item = TILES[entry];
  return item ? <AppIcon item={item} showLabel={showLabel} /> : null;
}

/** Where a placed entry sits on its page, in px. */
export function slotBox(p: Pick<Placed, "col" | "row" | "w" | "h">, g: HomeGeometry) {
  return {
    x: g.padX + p.col * (g.cellW + g.gapX),
    y: p.row * (g.cellH + g.gapY),
    w: p.w * g.cellW + (p.w - 1) * g.gapX,
    h: p.h * g.cellH + (p.h - 1) * g.gapY,
  };
}

/** Moves focus to the nearest home item in the arrow's direction; past the edge, turns the page. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>, pages: number, goToPage: (page: number, focus: "first" | "last") => void) {
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
  if (!dir || event.ctrlKey || event.metaKey || useOS.getState().wiggle) return;
  const items = [...event.currentTarget.querySelectorAll<HTMLElement>("[data-nav]")].filter((el) => !el.closest("[inert]"));
  const current = document.activeElement as HTMLElement | null;
  if (!current || !items.includes(current)) return;
  event.preventDefault();
  const from = current.getBoundingClientRect();
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;
  // Only items fully past the current item's edge in that direction
  const ahead = (r: DOMRect) =>
    dir[0] > 0 ? r.left >= from.right - 4 : dir[0] < 0 ? r.right <= from.left + 4 : dir[1] > 0 ? r.top >= from.bottom - 4 : r.bottom <= from.top + 4;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const item of items) {
    if (item === current) continue;
    const r = item.getBoundingClientRect();
    if (!ahead(r)) continue;
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const score = dx * dir[0] + dy * dir[1] + (Math.abs(dx * dir[1]) + Math.abs(dy * dir[0])) * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  if (best) best.focus();
  else if (dir[0] && current.closest("[data-home-page]")) {
    const page = useOS.getState().homePage + dir[0];
    if (page >= 0 && page < pages) goToPage(page, dir[0] > 0 ? "first" : "last");
  }
}

/** The pages themselves. Memoised: opening an app re-renders the layer, never the icons. */
const Pages = memo(function Pages({ placed, pages, page, geo }: { placed: Placed[]; pages: number; page: number; geo: HomeGeometry }) {
  return (
    <m.div style={{ x: homePagerX }} className="flex h-full">
      {Array.from({ length: pages }, (_, index) => (
        <div
          key={index}
          role="group"
          aria-label={`Home page ${index + 1} of ${pages}`}
          data-home-page={index}
          inert={page !== index}
          className="relative h-full w-full shrink-0"
        >
          {placed.map((p, i) => {
            if (p.page !== index) return null;
            const box = slotBox(p, geo);
            return (
              <div
                key={p.key}
                data-home-key={p.key}
                data-fly
                className="home-slot absolute top-0 left-0 flex justify-center *:w-full"
                style={
                  {
                    width: box.w,
                    height: box.h,
                    transform: `translate3d(${box.x}px, ${box.y}px, 0)`,
                    "--wiggle-delay": `${-((i * 97) % 260)}ms`,
                  } as CSSProperties
                }
              >
                <HomeEntry entry={p.key} />
              </div>
            );
          })}
        </div>
      ))}
    </m.div>
  );
});

export function HomeScreen({ open }: { open: boolean }) {
  const wiggle = useOS((s) => s.wiggle);
  const setWiggle = useOS((s) => s.setWiggle);
  const page = useOS((s) => s.homePage);
  const locked = useOS((s) => s.locked);
  const dock = useOS((s) => s.home.dock);
  const layerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const { geo, placed, pages, measured } = useHomeLayout(layerRef);
  const pagesRef = useRef(pages);
  const width = useRef(390);
  const suppressClick = useRef(false);
  const press = useRef<{ timer: number; x: number; y: number; fired: boolean } | null>(null);

  // Recedes behind an open app: scale 0.9 and dim, on the launch spring. No blur: it is the
  // most expensive thing a phone can draw while the window above it is moving.
  const recede = useRecede();
  const transform = useTransform(recede, (r) => (r < 0.001 ? "none" : `scale(${1 - (1 - HOME_SCALE_OPEN) * r})`));
  const dim = useTransform(recede, [0, 1], [0, 0.3]);

  // Behind an open app the home screen is inert, but only once the launch has landed: making ~250
  // elements inert restyles all of them, which in the tap's own frame delays the window's first
  // move. Closing makes it live again at once, so a tap mid-close still lands.
  const [covered, setCovered] = useState(false);
  if (!open && covered) setCovered(false);
  useEffect(() => {
    if (!open) return;
    const check = (p: number) => p >= 0.999 && setCovered(true);
    check(launchProgress.get());
    return launchProgress.on("change", check);
  }, [open]);

  const goToPage = (next: number, focus?: "first" | "last", velocity = 0) => {
    const p = Math.max(0, Math.min(pagesRef.current - 1, next));
    useOS.getState().setHomePage(p);
    animateTo(homePagerX, -p * width.current, prefersReducedMotion() ? { duration: 0 } : withVelocity("smooth", velocity));
    if (focus)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const items = layerRef.current?.querySelectorAll<HTMLElement>(`[data-home-page="${p}"] [data-nav]`);
          (focus === "first" ? items?.[0] : items?.[items.length - 1])?.focus({ preventScroll: true });
        }),
      );
  };

  // Pager geometry follows the screen width; fewer pages (a bigger screen) pull the pager back.
  useLayoutEffect(() => {
    pagesRef.current = pages;
    const el = viewportRef.current;
    if (!el) return;
    const sync = () => {
      width.current = el.clientWidth;
      const current = useOS.getState().homePage;
      if (current > pages - 1) useOS.getState().setHomePage(pages - 1);
      homePagerX.set(-Math.min(current, pages - 1) * width.current);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pages]);

  /* ───── Pager + pull-down Search (one gesture, locked to the first direction) ───── */
  const pullSearch = (amount: number) =>
    searchProgress.set(Math.max(0, Math.min(1.12, rubberBand(amount, SEARCH_PULL * 1.6) / SEARCH_PULL)));
  const settleSearch = (velocity: number) => {
    if (searchProgress.get() > 0.5 || velocity > 500) useOS.getState().setSpotlightOpen(true);
    else animateTo(searchProgress, 0, withVelocity("snappy", -velocity / SEARCH_PULL));
  };
  useDrag(
    (s) => {
      const { first, last, tap, axis, movement, velocity, direction, event, cancel, memo } = s;
      if (tap) return;
      if (first && (wiggle || startedIn(event, "[data-dock], [data-no-swipe]"))) {
        cancel();
        return;
      }
      if (first) window.clearTimeout(press.current?.timer);
      suppressClick.current = true;
      if (axis === "x") {
        const base = (memo as number | undefined) ?? homePagerX.get();
        const W = width.current;
        homePagerX.set(rubberClamp(base + movement[0], -(pagesRef.current - 1) * W, 0, W * 0.35));
        if (last) {
          const vx = velocity[0] * direction[0] * 1000;
          goToPage(Math.round(-(homePagerX.get() + project(vx, 0.99)) / W), undefined, vx);
        }
        return base;
      }
      if (axis === "y") {
        pullSearch(Math.max(0, movement[1]));
        if (last) settleSearch(velocity[1] * direction[1] * 1000);
      }
    },
    { target: layerRef, axis: "lock", filterTaps: true, threshold: 10, pointer: { capture: true }, enabled: !open && !locked },
  );

  // Trackpad: horizontal scroll pages; scrolling "up" pulls Search down.
  const wheel = useRef({ dx: 0, dy: 0, base: 0, timer: 0 });
  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (open || useOS.getState().locked || useOS.getState().spotlightOpen) return;
      const w = wheel.current;
      if (!w.timer) {
        w.dx = 0;
        w.dy = 0;
        w.base = homePagerX.get();
      }
      window.clearTimeout(w.timer);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        w.dx -= e.deltaX;
        const W = width.current;
        homePagerX.set(rubberClamp(w.base + w.dx, -(pagesRef.current - 1) * W, 0, W * 0.35));
      } else if (!useOS.getState().wiggle && (e.deltaY < 0 || w.dy > 0)) {
        w.dy = Math.max(0, w.dy - e.deltaY);
        pullSearch(w.dy * 0.8);
      }
      w.timer = window.setTimeout(() => {
        w.timer = 0;
        const W = width.current;
        const current = useOS.getState().homePage;
        if (Math.abs(w.dx) > W * 0.12) goToPage(current + (w.dx < 0 ? 1 : -1));
        else if (w.dx) goToPage(current);
        if (w.dy) settleSearch(0);
      }, 140);
    };
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  /* ───── Long-press → jiggle mode ───── */
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || wiggle) return;
    suppressClick.current = false;
    const state = { timer: 0, x: e.clientX, y: e.clientY, fired: false };
    state.timer = window.setTimeout(() => {
      state.fired = true;
      haptic();
      setWiggle(true);
    }, LONG_PRESS_MS);
    press.current = state;
  };
  const onPointerMove = (e: PointerEvent) => {
    const p = press.current;
    if (p && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) window.clearTimeout(p.timer);
  };
  const endPress = () => window.clearTimeout(press.current?.timer);

  const layerStyle = {
    transform,
    paddingTop: geo.top,
    paddingBottom: geo.bottom,
    "--icon": `${geo.icon}px`,
  } as unknown as CSSProperties;

  return (
    <m.div
      ref={layerRef}
      data-home-layer
      inert={covered || locked}
      aria-hidden={covered || undefined}
      style={layerStyle}
      className="absolute inset-0 flex touch-none flex-col"
      data-wiggle={wiggle || undefined}
      data-locked={locked || undefined}
      data-landscape={geo.landscape || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPress}
      onPointerCancel={endPress}
      onClickCapture={(e) => {
        // A long-press, page swipe or rearrange shouldn't also open what it started on.
        if (press.current?.fired || suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          if (press.current) press.current.fired = false;
          suppressClick.current = false;
          return;
        }
        if (wiggle && !(e.target as Element).closest("[data-wiggle-done]")) {
          e.preventDefault();
          e.stopPropagation();
          setWiggle(false);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        haptic();
        setWiggle(true);
      }}
      // A native link/image drag would steal the pointer from page swipes and rearranging.
      onDragStart={(e) => e.preventDefault()}
      onKeyDown={(e) => moveFocus(e, pages, goToPage)}
    >
      <div ref={viewportRef} data-home-grid data-measured={measured || undefined} className="relative min-h-0 flex-1 overflow-hidden">
        <nav aria-label="Apps" className="contents">
          <Pages placed={placed} pages={pages} page={page} geo={geo} />
        </nav>
      </div>

      <PageDots page={page} pages={pages} height={geo.search} onPage={(p) => goToPage(p)} />

      <Dock entries={dock} geo={geo} />

      {wiggle && (
        <button
          type="button"
          data-wiggle-done
          onClick={() => setWiggle(false)}
          className="glass-dark absolute right-[5cqw] z-[78] rounded-full px-3 py-1 text-[13px] font-semibold text-white"
          style={{ top: Math.max(4, geo.top - 30) }}
        >
          Done
        </button>
      )}

      <m.div aria-hidden style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
    </m.div>
  );
}

function PageDots({ page, pages, height, onPage }: { page: number; pages: number; height: number; onPage: (page: number) => void }) {
  const setSpotlightOpen = useOS((s) => s.setSpotlightOpen);
  return (
    <div data-fly="fade" className="flex items-start justify-center" style={{ height, paddingTop: height - 36 }} data-no-swipe>
      <div data-search-pill className="glass-chrome flex h-[28px] items-center gap-0.5 rounded-full pr-2 pl-0.5 text-white">
        <button
          type="button"
          data-nav
          aria-label="Search"
          onClick={() => setSpotlightOpen(true)}
          className="press-spring flex h-[26px] items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium tracking-[-0.01em]"
        >
          <Glyph name="search" className="size-[12px] opacity-90" />
          Search
        </button>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Page ${i + 1} of ${pages}`}
            aria-current={page === i ? "page" : undefined}
            onClick={() => onPage(i)}
            className="grid size-[14px] place-items-center"
          >
            <span className={`size-[6px] rounded-full transition-colors duration-200 ${page === i ? "bg-white" : "bg-white/35"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

/** Frosted dock; on desktop the icons magnify toward the pointer (springs, max 1.15×). */
function Dock({ entries, geo }: { entries: string[]; geo: HomeGeometry }) {
  const mouseX = useMotionValue(Infinity);
  // Icon centres, measured once as the mouse enters: reading layout on every move would force a
  // full layout mid-launch when the click lands on a dock icon
  const boxes = useRef(new Map<string, { center: number; width: number }>());
  const measure = (dock: HTMLElement) => {
    boxes.current.clear();
    for (const el of dock.querySelectorAll<HTMLElement>("[data-dock-key]")) {
      const r = el.getBoundingClientRect();
      boxes.current.set(el.dataset.dockKey!, { center: r.left + r.width / 2, width: r.width });
    }
  };
  const pad = geo.dockPad;
  const full = entries.length === 4 && !geo.landscape;
  return (
    <nav
      aria-label="Dock"
      data-dock
      data-fly="fade"
      onPointerEnter={(e) => e.pointerType === "mouse" && measure(e.currentTarget)}
      onPointerMove={(e) => e.pointerType === "mouse" && mouseX.set(e.clientX)}
      onPointerLeave={() => mouseX.set(Infinity)}
      className={
        full
          ? "glass-chrome mx-[4.1cqw] grid grid-cols-4 justify-items-center gap-x-[4.2cqw] rounded-[calc(var(--icon)*0.24+3.4cqw)] px-[4.9cqw]"
          : "glass-chrome mx-auto flex min-w-[calc(var(--icon)+32px)] justify-center rounded-[calc(var(--icon)*0.24+3.4cqw)] px-[16px]"
      }
      style={{ paddingTop: pad, paddingBottom: pad, minHeight: geo.icon + pad * 2, gap: full ? undefined : geo.gapX * 1.4 }}
    >
      {entries.map((entry) => (
        <DockItem key={entry} entry={entry} mouseX={mouseX} boxes={boxes}>
          <HomeEntry entry={entry} showLabel={false} />
        </DockItem>
      ))}
    </nav>
  );
}

function DockItem({
  entry,
  mouseX,
  boxes,
  children,
}: {
  entry: string;
  mouseX: MotionValue<number>;
  boxes: RefObject<Map<string, { center: number; width: number }>>;
  children: ReactNode;
}) {
  const target = useTransform(mouseX, (x) => {
    const box = boxes.current.get(entry);
    if (!box || !Number.isFinite(x)) return 1;
    const d = Math.abs(x - box.center) / box.width;
    return 1 + 0.15 * Math.max(0, 1 - d / 1.6);
  });
  const scale = useSpring(target, { stiffness: 500, damping: 40 });
  return (
    <m.div data-dock-key={entry} style={{ scale, transformOrigin: "50% 100%" }}>
      <div data-fly>{children}</div>
    </m.div>
  );
}
