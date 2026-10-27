"use client";

import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "motion/react";

import { appsLayout } from "@content/apps";
import type { AppId } from "@content/schema";
import { APPS, preloadApp } from "@/components/apps/registry";
import { AppWindow } from "@/components/os/AppWindow";
import { HomeScreen } from "@/components/os/HomeScreen";
import { SocialsFolder } from "@/components/os/SocialsFolder";
import { Spotlight } from "@/components/os/Spotlight";
import { goBack, useHashRouter } from "@/lib/router";
import { useOS } from "@/lib/store";

import { StatusBar } from "./StatusBar";
import { Wallpaper } from "./Wallpaper";

type WindowState = { app: AppId; closing: boolean; initial: boolean };

export function Phone() {
  useHashRouter();
  const route = useOS((s) => s.route);
  const reduceMotion = useOS((s) => s.reduceMotion);
  const screenRef = useRef<HTMLDivElement>(null);
  const [win, setWin] = useState<WindowState | null>(null);

  useEffect(() => useOS.getState().hydratePrefs(), []);

  // Route → window lifecycle (keeps the window mounted while it animates closed).
  // Adjusted during render when the routed app changes, per React's "storing info from previous renders".
  const windowApp = route.app && route.app !== "socials" ? route.app : null;
  const [prevApp, setPrevApp] = useState<AppId | null>(null);
  if (windowApp !== prevApp) {
    setPrevApp(windowApp);
    setWin((prev) => {
      if (windowApp) {
        if (prev?.app === windowApp) return prev.closing ? { ...prev, closing: false } : prev;
        return { app: windowApp, closing: false, initial: route.initial };
      }
      return prev ? { ...prev, closing: true } : null;
    });
  }

  // Esc closes the top-most layer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const { spotlightOpen, setSpotlightOpen, wiggle, setWiggle, route } = useOS.getState();
      if (spotlightOpen) setSpotlightOpen(false);
      else if (wiggle) setWiggle(false);
      else if (route.app) goBack();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Warm app chunks when the visitor points at an icon.
  const warm = (e: { target: EventTarget }) => {
    const app = (e.target as HTMLElement).closest<HTMLElement>("[data-app-icon]")?.dataset.appIcon;
    if (app && app in APPS) preloadApp(app as AppId);
  };

  const App = win ? APPS[win.app] : null;

  return (
    <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>
      <div className="phone-wrap" onPointerOver={warm} onFocus={warm}>
        <div className="phone-rim">
          <div className="phone-bezel">
            <div ref={screenRef} data-screen className="phone-screen">
              <Wallpaper />
              <HomeScreen open={!!win && !win.closing} />
              {win && App && (
                <AppWindow
                  key={win.app}
                  app={win.app}
                  title={appsLayout.titles[win.app]}
                  closing={win.closing}
                  initial={win.initial}
                  screenRef={screenRef}
                  onClosed={() => {
                    const app = win.app;
                    setWin(null);
                    screenRef.current
                      ?.querySelector<HTMLElement>(`[data-app-icon="${app}"]`)
                      ?.focus({ preventScroll: true });
                  }}
                >
                  <App />
                </AppWindow>
              )}
              <SocialsFolder open={route.app === "socials"} screenRef={screenRef} />
              <Spotlight />
              <StatusBar onApp={!!win && !win.closing} />
              <div className="phone-island" aria-hidden />
            </div>
          </div>
        </div>
        <span aria-hidden className="phone-btn top-[17%] -left-[2px] h-[3.5%]" />
        <span aria-hidden className="phone-btn top-[24%] -left-[2px] h-[6.5%]" />
        <span aria-hidden className="phone-btn top-[32.5%] -left-[2px] h-[6.5%]" />
        <span aria-hidden className="phone-btn top-[27%] -right-[2px] h-[10%]" />
      </div>
    </MotionConfig>
  );
}
