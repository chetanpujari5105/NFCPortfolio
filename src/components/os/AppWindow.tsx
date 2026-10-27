"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";

import { appsLayout, askApp } from "@content/apps";
import type { AppId } from "@content/schema";
import { closeSpring, FLICK_VELOCITY, launchProgress, launchSpring } from "@/lib/motion";
import { goHome } from "@/lib/router";
import { prefersReducedMotion } from "@/lib/store";

import { Glyph } from "./icons";

type Geometry = {
  /** Icon tile box, in untransformed screen coordinates */
  x: number;
  y: number;
  size: number;
  iconRadius: number;
  W: number;
  H: number;
  screenRadius: number;
};

const ITEMS = [...appsLayout.block, ...appsLayout.row, ...appsLayout.dock, askApp];

/** Layout position of the app's icon tile relative to the screen, ignoring transforms. */
function measure(screen: HTMLElement, app: AppId): Geometry {
  const W = screen.clientWidth;
  const H = screen.clientHeight;
  const screenRadius = parseFloat(getComputedStyle(screen).borderTopLeftRadius) || 0;
  const tile = screen.querySelector<HTMLElement>(`[data-icon-tile="${app}"]`);
  if (!tile) {
    const size = Math.min(W, H) * 0.16;
    return { x: (W - size) / 2, y: (H - size) / 2, size, iconRadius: size * 0.23, W, H, screenRadius };
  }
  let x = 0;
  let y = 0;
  let el: HTMLElement | null = tile;
  while (el && el !== screen) {
    x += el.offsetLeft;
    y += el.offsetTop;
    el = el.offsetParent as HTMLElement | null;
  }
  const size = tile.offsetWidth;
  return { x, y, size, iconRadius: size * 0.23, W, H, screenRadius };
}

const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Props = {
  app: AppId;
  title: string;
  closing: boolean;
  initial: boolean;
  screenRef: RefObject<HTMLDivElement | null>;
  onClosed: () => void;
  children: ReactNode;
};

export function AppWindow({ app, title, closing, initial, screenRef, onClosed, children }: Props) {
  const geo = useRef<Geometry | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const fade = useMotionValue(1);
  const reduced = useRef(false);
  const item = ITEMS.find((i) => i.app === app);

  const frame = (p: number) => {
    const g = geo.current;
    if (!g) return { transform: "none", clipPath: "none" };
    const L = Math.min(g.W, g.H);
    const s0 = g.size / L;
    const clipX = ((g.W - L) / 2) * (1 - p);
    const clipY = ((g.H - L) / 2) * (1 - p);
    const tx = (g.x - ((g.W - L) / 2) * s0) * (1 - p);
    const ty = (g.y - ((g.H - L) / 2) * s0) * (1 - p);
    const scale = mix(s0, 1, p);
    const radius = Math.max(0, mix(g.iconRadius / s0, g.screenRadius, Math.min(p, 1)));
    return {
      transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
      clipPath: `inset(${clipY}px ${clipX}px round ${radius}px)`,
    };
  };

  const transform = useTransform(launchProgress, (p) => frame(p).transform);
  const clipPath = useTransform(launchProgress, (p) => frame(p).clipPath);
  const contentOpacity = useTransform(launchProgress, [0.2, 0.6], [0, 1]);
  const overlayOpacity = useTransform(launchProgress, [0.25, 0.7], [1, 0]);

  // Measure before paint so the first frame already sits on the icon.
  useLayoutEffect(() => {
    if (screenRef.current) geo.current = measure(screenRef.current, app);
    reduced.current = prefersReducedMotion();
    if (initial) {
      launchProgress.set(1);
    } else if (reduced.current) {
      launchProgress.set(1);
      fade.set(0);
      controls.current = animate(fade, 1, { duration: 0.2, ease: "easeOut" });
    } else {
      launchProgress.set(0);
      controls.current = animate(launchProgress, 1, launchSpring);
    }
    return () => controls.current?.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app]);

  // Close (or re-open if the close is interrupted).
  useEffect(() => {
    controls.current?.stop();
    if (closing) {
      if (screenRef.current) geo.current = measure(screenRef.current, app);
      if (reduced.current) {
        controls.current = animate(fade, 0, { duration: 0.15, ease: "easeOut", onComplete: onClosed });
      } else {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          launchProgress.set(0);
          onClosed();
        };
        controls.current = animate(launchProgress, 0, {
          ...closeSpring,
          onUpdate: (p) => p < 0.015 && finish(),
          onComplete: finish,
        });
      }
    } else if (launchProgress.get() < 1 && !reduced.current) {
      controls.current = animate(launchProgress, 1, launchSpring);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  // Keep geometry right if the viewport changes while the app is open.
  useEffect(() => {
    const onResize = () => {
      if (screenRef.current) geo.current = measure(screenRef.current, app);
      launchProgress.set(launchProgress.get() + 1e-6);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [app, screenRef]);

  // Initial focus goes into the window; the focus trap keeps it there.
  useEffect(() => {
    const first = windowRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? windowRef.current)?.focus({ preventScroll: true });
  }, [app]);

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !windowRef.current) return;
    const nodes = [...windowRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (n) => n.offsetParent !== null,
    );
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // Swipe up on the home indicator: the window follows the finger toward its icon.
  const drag = useRef<{ y: number; t: number; lastY: number; lastT: number; v: number } | null>(null);
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (closing || drag.current) return; // ignore extra fingers
    e.currentTarget.setPointerCapture(e.pointerId);
    controls.current?.stop();
    drag.current = { y: e.clientY, t: e.timeStamp, lastY: e.clientY, lastT: e.timeStamp, v: 0 };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const g = geo.current;
    if (!d || !g) return;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.v = (d.lastY - e.clientY) / dt; // px/ms, upward positive
    d.lastY = e.clientY;
    d.lastT = e.timeStamp;
    const up = d.y - e.clientY;
    // Rubber-band: progress falls off with distance, never snaps past the icon.
    const pull = up > 0 ? up / (up + g.H * 0.55) : -Math.min(-up, 60) / 2000;
    launchProgress.set(1 - pull);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const up = d.y - e.clientY;
    if (up > 90 || (d.v > FLICK_VELOCITY && up > 12)) goHome();
    else controls.current = animate(launchProgress, 1, launchSpring);
  };

  const style = { transformOrigin: "0 0", transform, clipPath, opacity: fade } as unknown as CSSProperties;

  return (
    <motion.div
      ref={windowRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onKeyDown={trapFocus}
      style={style}
      className="absolute inset-0 z-40 overflow-hidden bg-app-background text-app-ink outline-none will-change-transform"
    >
      <motion.div style={{ opacity: contentOpacity }} className="absolute inset-0">
        {children}
      </motion.div>

      {/* The icon's face, fading out as the window grows */}
      {item && (
        <motion.div
          aria-hidden
          style={{
            opacity: overlayOpacity,
            background: `linear-gradient(165deg, ${item.colors[0]}, ${item.colors[1]})`,
          }}
          className="pointer-events-none absolute inset-0 grid place-items-center text-white"
        >
          <Glyph name={item.icon} className="w-[54cqmin]" />
        </motion.div>
      )}

      <div
        className="absolute inset-x-0 bottom-0 z-50 flex h-[34px] cursor-grab touch-none items-end justify-center pb-[max(env(safe-area-inset-bottom),8px)] active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-hidden
      >
        <span className="h-[5px] w-[36%] max-w-[140px] rounded-full bg-app-ink/85" />
      </div>
    </motion.div>
  );
}
