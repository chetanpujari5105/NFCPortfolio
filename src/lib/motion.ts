import { motionValue, type Transition } from "motion/react";

/** Strong ease-out for UI that enters or responds to input. */
export const easeOut = [0.23, 1, 0.32, 1] as const;
/** iOS-like sheet/drawer curve. */
export const easeDrawer = [0.32, 0.72, 0, 1] as const;

/** App launch: icon → full screen. */
export const launchSpring: Transition = { type: "spring", stiffness: 380, damping: 34, mass: 1 };
/** App close: a touch stiffer so exit feels quicker than entry. */
export const closeSpring: Transition = { type: "spring", stiffness: 420, damping: 38, mass: 1 };
/** Pushed detail views. */
export const pushTransition: Transition = { duration: 0.36, ease: easeDrawer };
export const popTransition: Transition = { duration: 0.26, ease: easeDrawer };
/** Folders, sheets, Spotlight. */
export const sheetTransition: Transition = { duration: 0.24, ease: easeOut };
export const fadeTransition: Transition = { duration: 0.18, ease: "easeOut" };

/** Home screen scale while an app is open. */
export const HOME_SCALE_OPEN = 0.92;

/**
 * Launch progress shared by the open app window and the home screen behind it:
 * 0 = app collapsed into its icon, 1 = app fills the screen.
 */
export const launchProgress = motionValue(0);

/** Velocity (px/ms) above which a swipe closes regardless of distance. */
export const FLICK_VELOCITY = 0.11;
