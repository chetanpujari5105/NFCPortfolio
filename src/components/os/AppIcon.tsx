"use client";

import type { CSSProperties, ReactNode } from "react";

import type { HomeItem } from "@content/schema";
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

export function AppIcon({ item, showLabel = true, tile, className }: Props) {
  const style = { "--c1": item.colors[0], "--c2": item.colors[1] } as CSSProperties;
  const content = (
    <>
      <span className="icon-tile wiggle-item" data-icon-tile={item.app ?? item.id} style={style}>
        {tile ?? <Glyph name={item.icon} />}
      </span>
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
      onClick={() => item.app && openApp(item.app)}
    >
      {content}
    </button>
  );
}
