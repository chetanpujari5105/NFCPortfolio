"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";

import type { HomeItem } from "@content/schema";
import { setLaunchOrigin } from "@/lib/launch";
import { springs } from "@/lib/motion";
import { openApp } from "@/lib/router";
import { cn } from "@/lib/utils";

import { Glyph } from "./icons";

type Props = {
  item: Pick<HomeItem, "id" | "label" | "icon" | "colors" | "app" | "href">;
  showLabel?: boolean;
  /** Custom tile content (e.g. the Socials folder preview) */
  tile?: ReactNode;
  className?: string;
};

/**
 * Press feedback on pointer-down: the tile sinks to 0.92 on the snappy spring and comes back
 * with a slight overshoot. Moving more than 10 px cancels the press (a page swipe has started).
 */
function usePress() {
  const scale = useMotionValue(1);
  const start = useRef<{ x: number; y: number } | null>(null);
  const release = () => {
    if (!start.current) return;
    start.current = null;
    animate(scale, 1, springs.release);
  };
  return {
    scale,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        if (e.button !== 0) return;
        start.current = { x: e.clientX, y: e.clientY };
        animate(scale, 0.92, springs.snappy);
      },
      onPointerMove: (e: PointerEvent) => {
        const s = start.current;
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10) release();
      },
      onPointerUp: release,
      onPointerCancel: release,
      onPointerLeave: release,
    },
  };
}

export function AppIcon({ item, showLabel = true, tile, className }: Props) {
  const style = { "--c1": item.colors[0], "--c2": item.colors[1] } as CSSProperties;
  const { scale, handlers } = usePress();
  const content = (
    <>
      <motion.span style={{ scale }} className="block">
        <span className="icon-tile wiggle-item" data-icon-tile={item.app ?? item.id} style={style}>
          {tile ?? <Glyph name={item.icon} />}
        </span>
      </motion.span>
      {showLabel && <span className="icon-label max-w-[calc(var(--icon)+14px)] truncate">{item.label}</span>}
    </>
  );
  const classes = cn(
    "icon-press flex flex-col items-center gap-[5px] rounded-[14px] outline-offset-4 select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]",
    className,
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${item.label} (opens in a new tab)`}
        data-nav
        className={classes}
        {...handlers}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Open ${item.label}`}
      data-app-icon={item.app}
      data-nav
      className={classes}
      {...handlers}
      onClick={(e) => {
        if (!item.app) return;
        const tileEl = e.currentTarget.querySelector<HTMLElement>("[data-icon-tile]");
        if (tileEl) setLaunchOrigin(item.app, tileEl);
        openApp(item.app);
      }}
    >
      {content}
    </button>
  );
}
