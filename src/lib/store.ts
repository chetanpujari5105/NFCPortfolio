import { create } from "zustand";

import type { AppId } from "@content/schema";
import { readStored, writeStored, type Finish } from "@/lib/theme";

export type Wallpaper = "ribbons" | "aurora" | "dusk";
export const WALLPAPERS: readonly Wallpaper[] = ["ribbons", "aurora", "dusk"];

export type Route = {
  app: AppId | null;
  /** Pushed detail view inside the app, e.g. a course id */
  sub: string | null;
  /** True for the route read on page load (deep link): open without animation */
  initial: boolean;
};

type OSState = {
  route: Route;
  finish: Finish;
  wallpaper: Wallpaper;
  reduceMotion: boolean;
  largeText: boolean;
  spotlightOpen: boolean;
  wiggle: boolean;
  /** Pre-filled subject for the Contact app ("Let's talk" from a service) */
  contactSubject: string;
  setRoute: (route: Route) => void;
  setFinish: (finish: Finish) => void;
  setWallpaper: (wallpaper: Wallpaper) => void;
  setReduceMotion: (on: boolean) => void;
  setLargeText: (on: boolean) => void;
  setSpotlightOpen: (open: boolean) => void;
  setWiggle: (on: boolean) => void;
  setContactSubject: (subject: string) => void;
  hydratePrefs: () => void;
};

export const PREF_KEYS = {
  wallpaper: "pp-wallpaper",
  reduceMotion: "pp-motion",
  largeText: "pp-text",
} as const;

export const useOS = create<OSState>()((set) => ({
  route: { app: null, sub: null, initial: true },
  finish: "electric",
  wallpaper: "ribbons",
  reduceMotion: false,
  largeText: false,
  spotlightOpen: false,
  wiggle: false,
  contactSubject: "",
  setRoute: (route) => set({ route }),
  setFinish: (finish) => set({ finish }),
  setWallpaper: (wallpaper) => {
    writeStored(PREF_KEYS.wallpaper, wallpaper);
    set({ wallpaper });
  },
  setReduceMotion: (on) => {
    writeStored(PREF_KEYS.reduceMotion, on ? "reduce" : "auto");
    document.documentElement.toggleAttribute("data-reduce-motion", on);
    set({ reduceMotion: on });
  },
  setLargeText: (on) => {
    writeStored(PREF_KEYS.largeText, on ? "large" : "default");
    if (on) document.documentElement.setAttribute("data-text", "large");
    else document.documentElement.removeAttribute("data-text");
    set({ largeText: on });
  },
  setSpotlightOpen: (spotlightOpen) => set({ spotlightOpen }),
  setWiggle: (wiggle) => set({ wiggle }),
  setContactSubject: (contactSubject) => set({ contactSubject }),
  hydratePrefs: () =>
    set({
      finish: readStored("pp-finish", ["electric", "graphite", "chai"] as const) ?? "electric",
      wallpaper: readStored(PREF_KEYS.wallpaper, WALLPAPERS) ?? "ribbons",
      reduceMotion: readStored(PREF_KEYS.reduceMotion, ["reduce", "auto"] as const) === "reduce",
      largeText: readStored(PREF_KEYS.largeText, ["large", "default"] as const) === "large",
    }),
}));

/** Motion is reduced if the OS asks for it or the visitor toggled it in Settings. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    useOS.getState().reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
