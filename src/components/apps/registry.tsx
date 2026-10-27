"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { AppId } from "@content/schema";

/** Blank app-coloured screen while an app's code loads (usually under the launch animation). */
function Loading() {
  return <div className="absolute inset-0 bg-app-background" />;
}



/** Every app is its own chunk; only the home screen ships in the initial bundle. */
export const APPS: Partial<Record<AppId, ComponentType>> = {
  courses: dynamic(() => import("./courses"), { loading: Loading }),
  journey: dynamic(() => import("./journey"), { loading: Loading }),
  expertise: dynamic(() => import("./expertise"), { loading: Loading }),
  platforms: dynamic(() => import("./platforms"), { loading: Loading }),
  projects: dynamic(() => import("./projects"), { loading: Loading }),
  blog: dynamic(() => import("./blog"), { loading: Loading }),
  reviews: dynamic(() => import("./reviews"), { loading: Loading }),
  services: dynamic(() => import("./services"), { loading: Loading }),
  contact: dynamic(() => import("./contact"), { loading: Loading }),
  settings: dynamic(() => import("./settings"), { loading: Loading }),
  ask: dynamic(() => import("./ask"), { loading: Loading }),
};

/** Warm an app's chunk on hover/focus so the launch never waits on the network. */
export function preloadApp(app: AppId) {
  const loaders: Partial<Record<AppId, () => Promise<unknown>>> = {
    courses: () => import("./courses"),
    journey: () => import("./journey"),
    expertise: () => import("./expertise"),
    platforms: () => import("./platforms"),
    projects: () => import("./projects"),
    blog: () => import("./blog"),
    reviews: () => import("./reviews"),
    services: () => import("./services"),
    contact: () => import("./contact"),
    settings: () => import("./settings"),
  };
  void loaders[app]?.();
}
