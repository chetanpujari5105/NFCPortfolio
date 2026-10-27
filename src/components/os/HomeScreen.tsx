"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { motion, useTransform } from "motion/react";

import { appsLayout, askApp } from "@content/apps";
import { HOME_SCALE_OPEN, useRecede } from "@/lib/motion";
import { ENABLE_ASK } from "@/lib/router";
import { useOS } from "@/lib/store";

import { AppIcon } from "./AppIcon";
import { Glyph } from "./icons";
import { ImpactWidget } from "./ImpactWidget";
import { socialIcons, FOLDER_SOCIALS } from "./social-icons";
import { WorkWidget } from "./WorkWidget";

const LONG_PRESS_MS = 520;

function FolderTile() {
  return (
    <span className="grid size-full grid-cols-3 content-center gap-[8%] p-[16%]">
      {FOLDER_SOCIALS.map((id) => (
        <span
          key={id}
          className="aspect-square rounded-[24%]"
          style={{
            background: `linear-gradient(165deg, ${socialIcons[id].colors[0]}, ${socialIcons[id].colors[1]})`,
          }}
        />
      ))}
    </span>
  );
}

/** Moves focus to the nearest home item in the arrow's direction. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const dir = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  }[event.key];
  if (!dir) return;
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>("[data-nav]"),
  ];
  const current = document.activeElement as HTMLElement | null;
  if (!current || !items.includes(current)) return;
  event.preventDefault();
  const from = current.getBoundingClientRect();
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;
  // Only items fully past the current item's edge in that direction
  const ahead = (r: DOMRect) =>
    dir[0] > 0
      ? r.left >= from.right - 4
      : dir[0] < 0
        ? r.right <= from.left + 4
        : dir[1] > 0
          ? r.top >= from.bottom - 4
          : r.bottom <= from.top + 4;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const item of items) {
    if (item === current) continue;
    const r = item.getBoundingClientRect();
    if (!ahead(r)) continue;
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;
    const along = dx * dir[0] + dy * dir[1];
    const across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
    const score = along + across * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  }
  best?.focus();
}

export function HomeScreen({ open }: { open: boolean }) {
  const wiggle = useOS((s) => s.wiggle);
  const setWiggle = useOS((s) => s.setWiggle);
  const setSpotlightOpen = useOS((s) => s.setSpotlightOpen);
  // Recedes behind an open app: scale 0.9, dim and a slight blur, all on the launch spring
  const recede = useRecede();
  const transform = useTransform(recede, (r) => `scale(${1 - (1 - HOME_SCALE_OPEN) * r})`);
  const filter = useTransform(recede, (r) => (r < 0.01 ? "none" : `blur(${r * 3}px)`));
  const dim = useTransform(recede, [0, 1], [0, 0.3]);
  const press = useRef<{
    timer: number;
    x: number;
    y: number;
    fired: boolean;
  } | null>(null);

  const row = appsLayout.row;

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    const state = { timer: 0, x: e.clientX, y: e.clientY, fired: false };
    state.timer = window.setTimeout(() => {
      state.fired = true;
      setWiggle(true);
    }, LONG_PRESS_MS);
    press.current = state;
  };
  const cancelPress = (e?: PointerEvent) => {
    const p = press.current;
    if (!p) return;
    if (
      e &&
      Math.hypot(e.clientX - p.x, e.clientY - p.y) < 8 &&
      e.type === "pointermove"
    )
      return;
    window.clearTimeout(p.timer);
    if (e?.type !== "pointerup") press.current = null;
  };

  return (
    <motion.div
      data-home-layer
      inert={open}
      aria-hidden={open || undefined}
      style={{ transform, filter }}
      className="absolute inset-0 flex flex-col px-[5.6cqw] pt-[max(env(safe-area-inset-top),7.4cqh)] pb-[max(env(safe-area-inset-bottom),1.4cqh)] [--icon:min(62px,15.6cqw)] tab:pt-[7.4cqh]"
      data-wiggle={wiggle || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={cancelPress}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onClickCapture={(e) => {
        // A long-press shouldn't also open the app it started on.
        if (press.current?.fired) {
          e.preventDefault();
          e.stopPropagation();
          press.current = null;
          return;
        }
        if (wiggle) {
          e.preventDefault();
          e.stopPropagation();
          setWiggle(false);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setWiggle(true);
      }}
      onKeyDown={moveFocus}
    >
      <nav aria-label="Apps" className="flex min-h-0 flex-1 flex-col">
        <div className="grid grid-cols-4 gap-x-[4.2cqw] gap-y-[2.3cqh]">
          <ImpactWidget />
          <WorkWidget />
          {appsLayout.block.map((item) => (
            <AppIcon key={item.id} item={item} />
          ))}
          {row.map((item) =>
            item.id === "socials" ? (
              <AppIcon
                key={item.id}
                item={{
                  ...item,
                  colors: [
                    "rgb(255 255 255 / 0.28)",
                    "rgb(255 255 255 / 0.16)",
                  ],
                }}
                tile={<FolderTile />}
                className="[&_.icon-tile]:backdrop-blur-xl"
              />
            ) : (
              <AppIcon key={item.id} item={item} />
            ),
          )}
          {ENABLE_ASK && <AppIcon item={askApp} />}
        </div>

        <div className="flex flex-1 items-end justify-center pb-[1.6cqh]">
          <button
            type="button"
            data-nav
            onClick={() => setSpotlightOpen(true)}
            className="glass-dark flex h-[30px] items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-transform duration-150 ease-out active:scale-[0.95]"
          >
            <Glyph name="search" className="size-[13px]" />
            Search
          </button>
        </div>
      </nav>

      <nav
        aria-label="Dock"
        data-dock
        className="glass-dark grid grid-cols-4 justify-items-center gap-x-[4.2cqw] rounded-[30px] px-[3.4cqw] py-[1.5cqh] shadow-[inset_0_1px_0_rgb(255_255_255/0.22)]"
      >
        {appsLayout.dock.map((item) => (
          <AppIcon key={item.id} item={item} showLabel={false} />
        ))}
      </nav>

      {wiggle && (
        <button
          type="button"
          onClick={() => setWiggle(false)}
          className="glass-dark absolute top-[max(env(safe-area-inset-top),6.4cqh)] right-[5cqw] rounded-full px-3 py-1 text-[13px] font-semibold text-white"
        >
          Done
        </button>
      )}

      <motion.div
        aria-hidden
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 bg-black"
      />
    </motion.div>
  );
}
