"use client";

// Imperative three.js frame-loop code: materials, camera and the shared rig are mutated on purpose.
/* eslint-disable react-hooks/immutability */

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer, useGLTF } from "@react-three/drei";
import { easing } from "maath";
import * as THREE from "three";

import { FINISH_INFO } from "@/components/studio/FinishSwatches";
import { DEVICE, SCREEN_INSET_RATIO } from "@/lib/device";
import { startedIn } from "@/lib/gesture";
import { phoneTilt } from "@/lib/motion";
import { useOS } from "@/lib/store";

/*
 * The 3D phone: the iPhone 18 Pro Max model (public/models, see scripts/optimize-phone-model.mjs),
 * scaled to the same proportions as the CSS phone (lib/device.ts). The live OS screen is real DOM,
 * moved into the drei <Html transform> host by <Phone>, so it stays crisp and clickable;
 * `occlude="blending"` lets the body hide it when the back faces the camera.
 *
 * World units: the phone is 9 units tall (163.35 mm): 78 × 163.35 × 8.7 mm.
 */

export const PHONE_H = 9;
export const PHONE_W = PHONE_H * DEVICE.aspect;
const DEPTH = PHONE_H * DEVICE.depth;
const RADIUS = PHONE_H * DEVICE.radius;
/** Screen inset from the outer edge, same ratio as the CSS phone (rim + bezel) */
export const SCREEN_INSET = PHONE_H * SCREEN_INSET_RATIO;
export const SCREEN_W = PHONE_W - SCREEN_INSET * 2;
export const SCREEN_H = PHONE_H - SCREEN_INSET * 2;
/** Display corners concentric with the outer corners */
const SCREEN_R = RADIUS - SCREEN_INSET;
const FRONT_Z = DEPTH / 2;

const MODEL_URL = "/models/iphone-18-pro-max-burgundy.glb";
/** The model as exported, in metres: Y up, the display facing +Z, the frame from y = 0 to 163.35 mm */
const MODEL = { bottom: -0.000015, height: 0.163353, front: 0.004322 };
const MODEL_SCALE = PHONE_H / MODEL.height;
// Fetch the model as soon as this chunk loads (on the visitor's first sign of life), not on mount.
// Meshopt only: the Draco decoder would come from a CDN, and the file doesn't use it.
useGLTF.preload(MODEL_URL, false);

const DEG = Math.PI / 180;
/** Pointer parallax, at most this far either way, eased slowly */
const MAX_TILT = 3 * DEG;
const TILT_SMOOTH = 0.35;
/** Pitch follows the drag's vertical travel, clamped, and springs flat on release */
const MAX_PITCH = 12 * DEG;
/** Rotation per px of drag (0.6°/px: 300 px is a half turn) */
const RAD_PER_PX = 0.6 * DEG;
/** A drag only turns the phone past this much horizontal travel, and only if it is mostly horizontal */
export const SPIN_THRESHOLD = 12;
/** Release velocity is projected this far ahead (s), capped at a quarter turn */
const PROJECT_S = 0.15;
const MAX_PROJECT = Math.PI / 2;
/** Critically damped settle (ω = 14 rad/s ≈ 450 ms to rest, no overshoot) */
const SETTLE_W = 14;
/** Parallax holds still this long after any press, so nothing moves under a click */
const CALM_AFTER_PRESS_MS = 600;
/** Drags never start on the live screen or on anything you can press */
const NO_SPIN = "[data-screen], .stage-screen, button, a, input, textarea, select, label, [role='button'], [data-no-spin]";

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Shared mutable state between the gesture handlers (DOM) and the frame loop (WebGL). */
export type Rig = {
  rotY: number;
  rotX: number;
  velY: number;
  velX: number;
  dragging: boolean;
  /** Face the phone rests on or springs to, in half turns (rotY target = face·π). Even = front. */
  face: number;
  pointer: { x: number; y: number; over: boolean };
  /** Parallax is frozen until this time (performance.now ms) */
  calmUntil: number;
  /** An app or system layer is open: the visitor is using the screen, so parallax holds still */
  busy: boolean;
  pressed: number | null;
  /** Requests a frame (set once the canvas exists) */
  invalidate: () => void;
  /** Half a turn to the other face (the studio's Flip button) */
  flip: () => void;
};

const newRig = (): Rig => {
  const rig: Rig = {
    rotY: 0,
    rotX: 0,
    velY: 0,
    velX: 0,
    dragging: false,
    face: 0,
    pointer: { x: 0, y: 0, over: false },
    calmUntil: 0,
    busy: false,
    pressed: null,
    invalidate: () => {},
    flip: () => flipRig(rig),
  };
  return rig;
};

const showingBack = (angle: number) => Math.cos(angle) < 0;

function flipRig(rig: Rig) {
  if (rig.dragging) return;
  rig.face = Math.round(rig.rotY / Math.PI) + 1;
  rig.invalidate();
}

/* ───────────────────────────── Glass sheen ───────────────────────────── */

/** A faint diagonal reflection across the front glass (alpha only, drawn over the live screen). */
function useGlassSheen() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.055)");
    grad.addColorStop(0.42, "rgba(255,255,255,0)");
    grad.addColorStop(0.7, "rgba(255,255,255,0)");
    grad.addColorStop(0.78, "rgba(255,255,255,0.025)");
    grad.addColorStop(0.86, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    // ShapeGeometry UVs are positions in world units: map the screen rect onto [0, 1]
    tex.repeat.set(1 / SCREEN_W, 1 / SCREEN_H);
    tex.offset.set(0.5, 0.5);
    return tex;
  }, []);
}

/* ───────────────────────────── Back mark ───────────────────────────── */

/**
 * The model ships with a manufacturer logo on its back. Its licence isn't confirmed, so unless
 * NEXT_PUBLIC_SHOW_MODEL_LOGO=true the logo mesh is hidden and the ⚡ CP mark takes its place,
 * in a satin metal that follows the logo's colour (so every finish tints it).
 */
const SHOW_MODEL_LOGO = process.env.NEXT_PUBLIC_SHOW_MODEL_LOGO === "true";
const LOGO_NODE = "Back_Logo";
/** How much lighter than the logo colour the mark's metal is */
const MARK_LIFT = 1.6;

/** ⚡ over "CP", white on black: an alpha map (the original bolt from the site's own icon). */
function useMarkTexture(enabled: boolean) {
  return useMemo(() => {
    if (!enabled) return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 640;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#fff";
    g.beginPath();
    // icon.svg's bolt (64-unit grid), scaled ×8.6 and centred over the letters
    const bolt = [[36.5, 8], [17, 36], [29.5, 36], [26, 56], [47, 26.5], [34.2, 26.5]];
    bolt.forEach(([x, y], i) => (i ? g.lineTo(x * 8.6 - 19, y * 8.6 - 60) : g.moveTo(x * 8.6 - 19, y * 8.6 - 60)));
    g.closePath();
    g.fill();
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = `700 118px -apple-system, "SF Pro Display", "Helvetica Neue", Arial, sans-serif`;
    g.fillText("CP", 256, 620);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }, [enabled]);
}

/* ───────────────────────────── The device ───────────────────────────── */

/** The model's coloured parts: the metal frame (and plateau) and the back glass family. */
const FRAME_MATERIALS = /^COLOUR_Cherry_(Side_Panel|Side_Panel_Gloss|Aniso|Screws|Button_Detail_Border)$/;
const BACK_MATERIALS = /^COLOUR_Cherry_(Backpanel|Apple|Plastic|Antenna|Side_Button_Detail)$/;
/** Each group's main surface: the others keep their brightness relative to it when tinted */
const FRAME_REF = "COLOUR_Cherry_Side_Panel";
const BACK_REF = "COLOUR_Cherry_Backpanel";

/** The camera control is the model's one separate button: it presses in (metres, model space). */
const BUTTON_NODES = ["Side_Button", "Side_Button_Detail_Border"];
const BUTTON_TRAVEL = 0.0003;
const BUTTON_HIT = { position: [0.0389, 0.0514, 0] as const, size: [0.0024, 0.0175, 0.004] as const };

type Tinted = { material: THREE.MeshStandardMaterial; base: THREE.Color; part: "frame" | "back"; share: number };

const luminance = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;

function Device({
  rig,
  onHost,
  portal,
  hostSize,
  onLanded,
  stage,
}: {
  rig: Rig;
  onHost: (el: HTMLDivElement | null) => void;
  portal: RefObject<HTMLDivElement | null>;
  hostSize: { w: number; h: number; phonePx: number };
  onLanded: () => void;
  stage: RefObject<HTMLDivElement | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const host = useRef<HTMLDivElement | null>(null);
  const finish = useOS((s) => s.finish);
  const { scene } = useGLTF(MODEL_URL, false);
  const sheen = useGlassSheen();
  const markTex = useMarkTexture(!SHOW_MODEL_LOGO);
  // Make the entrance only if the CSS phone is still waiting for us (first load on desktop).
  const [arrive] = useState(() => document.documentElement.hasAttribute("data-stage-wait"));
  const arrival = useRef({ p: arrive ? 0 : 1, v: 0, landed: !arrive });
  const tilt = useRef({ x: 0, y: 0 });
  const press = useRef(0);
  const hit = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);

  const geo = useMemo(() => ({ screen: new THREE.ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, SCREEN_R), 32) }), []);
  const sheenMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: sheen, transparent: true, depthWrite: false, toneMapped: false }),
    [sheen],
  );
  useEffect(
    () => () => {
      geo.screen.dispose();
      sheenMat.dispose();
      sheen.dispose();
    },
    [geo, sheenMat, sheen],
  );

  // One pass over the loaded model: the parts the finish recolours, and the camera control.
  const parts = useMemo(() => {
    const tinted: Tinted[] = [];
    const seen = new Set<THREE.Material>();
    let frameRef = 1;
    let backRef = 1;
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (seen.has(material)) return;
      seen.add(material);
      const part = FRAME_MATERIALS.test(material.name) ? "frame" : BACK_MATERIALS.test(material.name) ? "back" : null;
      if (!part) return;
      const base = material.color.clone();
      if (material.name === FRAME_REF) frameRef = luminance(base);
      if (material.name === BACK_REF) {
        backRef = luminance(base);
        // Opaque: the back glass is translucent in the model, which would show the live screen
        // (behind the canvas) through it when the phone is turned around.
        material.transparent = false;
        material.opacity = 1;
      }
      tinted.push({ material, base, part, share: 0 });
    });
    tinted.forEach((t) => (t.share = luminance(t.base) / (t.part === "frame" ? frameRef : backRef)));
    const buttons = BUTTON_NODES.map((name) => scene.getObjectByName(name)).filter((o): o is THREE.Object3D => !!o);
    buttons.forEach((b) => (b.userData.x = b.position.x));
    // The back logo: where it sits in model space, so the CP mark can take its exact place
    const logo = scene.getObjectByName(LOGO_NODE) as THREE.Mesh | undefined;
    let mark: { center: THREE.Vector3; size: THREE.Vector3; material: THREE.Material } | null = null;
    if (logo) {
      logo.visible = SHOW_MODEL_LOGO;
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(logo).applyMatrix4(scene.matrixWorld.clone().invert());
      mark = { center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()), material: logo.material as THREE.Material };
      mark.center.z = box.min.z;
    }
    return { tinted, buttons, mark };
  }, [scene]);
  // The mark: satin metal a step lighter than the logo colour (so it follows the finish), cut out
  // by the ⚡ CP alpha map. A flat plane in the logo's glossy material would mirror the dark studio.
  const markMat = useMemo(() => {
    if (!markTex || !parts.mark) return null;
    return new THREE.MeshStandardMaterial({
      alphaMap: markTex,
      transparent: true,
      depthWrite: false,
      metalness: 0.75,
      roughness: 0.38,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
  }, [markTex, parts]);
  useEffect(
    () => () => {
      markTex?.dispose();
      markMat?.dispose();
    },
    [markTex, markMat],
  );

  // Finish colours: Burgundy is the model as shipped; the others tint each part, keeping its
  // brightness relative to the main surface. Starts where it is and blends over ~400 ms (useFrame).
  const targets = useMemo(() => {
    const f = FINISH_INFO[finish];
    const frame = new THREE.Color(f.frame);
    const back = new THREE.Color(f.back);
    return parts.tinted.map((t) =>
      finish === "burgundy" ? t.base : (t.part === "frame" ? frame : back).clone().multiplyScalar(t.share),
    );
  }, [finish, parts]);
  const firstColor = useRef(true);
  useEffect(() => {
    if (firstColor.current) {
      parts.tinted.forEach((t, i) => t.material.color.copy(targets[i]));
      firstColor.current = false;
    }
    invalidate();
  }, [targets, parts, invalidate]);

  useFrame((state, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const dt = Math.min(rawDelta, 1 / 20);
    let moving = false;

    // Arrival: one spring (stiffness 120, damping 20) for rise, turn and fade.
    const a = arrival.current;
    if (a.p < 0.999 || Math.abs(a.v) > 0.001) {
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        a.v += (-120 * (a.p - 1) - 20 * a.v) * h;
        a.p += a.v * h;
      }
      moving = true;
    } else if (!a.landed) {
      a.p = 1;
      a.landed = true;
      onLanded();
    }
    const away = 1 - a.p;
    if (stage.current) stage.current.style.opacity = String(Math.min(1, a.p * 1.4));

    // Settle: one critically damped spring to the resting face (no overshoot, no coasting).
    if (!rig.dragging) {
      const goal = rig.face * Math.PI;
      const k = SETTLE_W * SETTLE_W;
      const c = 2 * SETTLE_W;
      for (let i = 0; i < 4; i++) {
        const h = dt / 4;
        rig.velY += (-k * (rig.rotY - goal) - c * rig.velY) * h;
        rig.rotY += rig.velY * h;
        rig.velX += (-k * rig.rotX - c * rig.velX) * h;
        rig.rotX += rig.velX * h;
      }
      if (Math.abs(rig.rotY - goal) > 1e-4 || Math.abs(rig.velY) > 1e-3 || Math.abs(rig.rotX) > 1e-4) moving = true;
      else if (rig.rotY !== goal || rig.rotX !== 0) {
        // At rest: snap exactly onto the face and fold the angle back to 0 or π
        rig.face = ((rig.face % 2) + 2) % 2;
        rig.rotY = rig.face * Math.PI;
        rig.rotX = rig.velY = rig.velX = 0;
      }
    } else moving = true;

    // Pointer parallax. It holds exactly where it is while the visitor uses the screen, while any
    // layer is open, and just after a press, so the phone never shifts under the cursor.
    const p = rig.pointer;
    const frozen = p.over || rig.busy || rig.dragging || performance.now() < rig.calmUntil;
    if (frozen) {
      if (performance.now() < rig.calmUntil) moving = true;
    } else {
      moving = easing.damp(tilt.current, "x", p.y * MAX_TILT, TILT_SMOOTH, dt) || moving;
      moving = easing.damp(tilt.current, "y", p.x * MAX_TILT, TILT_SMOOTH, dt) || moving;
    }
    phoneTilt.x.set(tilt.current.y / MAX_TILT);
    phoneTilt.y.set(tilt.current.x / MAX_TILT);

    g.rotation.y = rig.rotY + tilt.current.y + away * -18 * DEG;
    g.rotation.x = rig.rotX + tilt.current.x + away * 8 * DEG;
    g.position.y = away * -(40 / hostSize.phonePx) * PHONE_H;

    // Finish colour blend
    parts.tinted.forEach((t, i) => {
      moving = easing.dampC(t.material.color, targets[i], 0.12, dt) || moving;
    });
    if (markMat && parts.mark) markMat.color.copy((parts.mark.material as THREE.MeshStandardMaterial).color).multiplyScalar(MARK_LIFT);

    // The glass reflection drifts a touch with the parallax, like light on a real cover glass
    sheen.offset.set(0.5 - tilt.current.y * 1.6, 0.5 + tilt.current.x * 1.6);

    // Camera control: press in, spring out
    const want = rig.pressed === null ? 0 : 1;
    const v = press.current;
    const next = v + (want - v) * (1 - Math.exp(-dt * (want ? 40 : 18)));
    press.current = Math.abs(next - want) < 1e-3 ? want : next;
    parts.buttons.forEach((b) => (b.position.x = b.userData.x - press.current * BUTTON_TRAVEL));
    if (press.current !== want) moving = true;
    const control = press.current > 0.5 ? "pressed" : "released";
    if (stage.current && stage.current.dataset.cameraControl !== control) stage.current.dataset.cameraControl = control;

    // The screen is only interactive while it faces the camera.
    const facing = !showingBack(g.rotation.y);
    if (host.current && host.current.inert === facing) host.current.inert = !facing;
    const s = stage.current;
    if (s) {
      s.dataset.roty = String(Math.round((rig.rotY * 18000) / Math.PI) / 100);
      s.dataset.rotx = String(Math.round((rig.rotX * 18000) / Math.PI) / 100);
      s.dataset.face = facing ? "front" : "back";
    }

    if (moving) state.invalidate();
    // At rest, where the camera control is on the page (for tests and the scripts in scripts/)
    else if (s && hit.current && facing) {
      const p = hit.current.getWorldPosition(new THREE.Vector3()).project(state.camera);
      const r = state.gl.domElement.getBoundingClientRect();
      s.dataset.cameraControlAt = `${Math.round(r.left + ((p.x + 1) / 2) * r.width)},${Math.round(r.top + ((1 - p.y) / 2) * r.height)}`;
    }
  });

  const pressButton = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    rig.pressed = 0;
    invalidate();
    const release = () => {
      rig.pressed = null;
      invalidate();
      window.removeEventListener("pointerup", release);
    };
    window.addEventListener("pointerup", release);
  };

  return (
    <group ref={group}>
      {/* The model: centred on its frame, the front glass on z = FRONT_Z */}
      <group scale={MODEL_SCALE} position={[0, -(MODEL.bottom + MODEL.height / 2) * MODEL_SCALE, FRONT_Z - MODEL.front * MODEL_SCALE]}>
        <primitive object={scene} dispose={null} />
        {markMat && parts.mark && (
          <mesh position={[parts.mark.center.x, parts.mark.center.y, parts.mark.center.z - 0.00002]} rotation-y={Math.PI} material={markMat}>
            {/* Same height as the logo it replaces; the texture is 4:5 */}
            <planeGeometry args={[parts.mark.size.y * 1.15 * 0.8, parts.mark.size.y * 1.15]} />
          </mesh>
        )}
        {/* The camera control's hit area (the only mesh with a handler, so pointer moves stay cheap) */}
        <mesh ref={hit} position={BUTTON_HIT.position} onPointerDown={pressButton}>
          <boxGeometry args={BUTTON_HIT.size} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </group>

      {/* The live OS. A rounded occluder punches the screen hole in the canvas. */}
      <Html
        transform
        occlude="blending"
        portal={portal as RefObject<HTMLElement>}
        geometry={<primitive object={geo.screen} attach="geometry" />}
        distanceFactor={(400 * SCREEN_H) / hostSize.h}
        position-z={FRONT_Z + 0.004}
        zIndexRange={[20, 0]}
      >
        <div
          ref={(el) => {
            host.current = el;
            onHost(el);
          }}
          className="stage-screen"
          style={{
            width: hostSize.w,
            height: hostSize.h,
            ["--phone-h" as string]: `${hostSize.phonePx}px`,
          }}
        />
      </Html>

      {/* Glass sheen over the screen: drawn after the occluder, so it lies on top of the live DOM */}
      <mesh geometry={geo.screen} material={sheenMat} position-z={FRONT_Z + 0.006} renderOrder={10} />
    </group>
  );
}

/** Keeps the phone 1:1 with the CSS layout: same height in px and the same centre. */
function CameraRig({ phonePx, offset }: { phonePx: number; offset: { x: number; y: number } }) {
  const camera = useThree((s) => s.camera as THREE.PerspectiveCamera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const unitsPerPx = PHONE_H / phonePx;
    // Distance at which the *screen plane* (front face) renders at exactly 1 css px per px
    const d = (size.height * unitsPerPx) / (2 * Math.tan((camera.fov * DEG) / 2)) + FRONT_Z;
    camera.position.set(-offset.x * unitsPerPx, offset.y * unitsPerPx, d);
    camera.lookAt(-offset.x * unitsPerPx, offset.y * unitsPerPx, 0);
    camera.near = 0.5;
    camera.far = d + 30;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, phonePx, offset, invalidate]);
  return null;
}

class Fallback extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export type Phone3DProps = {
  stage: RefObject<HTMLDivElement | null>;
  rig: Rig;
  hostSize: { w: number; h: number; phonePx: number };
  offset: { x: number; y: number };
  onHost: (el: HTMLDivElement | null) => void;
  onLanded: () => void;
  onError: () => void;
};

export default function Phone3D({ stage, rig, hostSize, offset, onHost, onLanded, onError }: Phone3DProps) {
  // Pointer parallax + "is the pointer over the screen"; any press calms the parallax for a moment.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rig.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      rig.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      rig.pointer.over = !!(e.target as Element | null)?.closest?.("[data-screen]");
      rig.invalidate();
    };
    const onPress = () => {
      rig.calmUntil = performance.now() + CALM_AFTER_PRESS_MS;
      rig.invalidate();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onPress, {
      capture: true,
      passive: true,
    });
    window.addEventListener("click", onPress, { capture: true, passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPress, { capture: true });
      window.removeEventListener("click", onPress, { capture: true });
    };
  }, [rig]);

  // Open apps and system layers count as "using the screen".
  useEffect(() => {
    const sync = (s: ReturnType<typeof useOS.getState>) => {
      const busy = !!s.route.app || s.spotlightOpen || s.switcherOpen || s.panelOpen;
      if (busy !== rig.busy) {
        rig.busy = busy;
        rig.invalidate();
      }
    };
    sync(useOS.getState());
    return useOS.subscribe(sync);
  }, [rig]);

  // Deliberate drags on the stage turn the phone; nothing else does. A press stays "pending" until
  // it has moved more than SPIN_THRESHOLD px, mostly sideways; anything else (clicks, jitter,
  // vertical drags) never turns it. While dragging, rotation follows the pointer 1:1; on release the
  // velocity is projected a little (≤ 90°) and the phone settles on the nearest face and stays.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    type Press = {
      id: number;
      x0: number;
      y0: number;
      ox: number;
      oy: number;
      from: number;
      turning: boolean;
      samples: [number, number][];
    };
    let press: Press | null = null;

    const end = (release: boolean) => {
      const g = press;
      press = null;
      if (!g?.turning) return;
      let v = 0;
      if (release) {
        // Release velocity (rad/s) from the last 80 ms of movement; a pause before release is 0
        const now = performance.now();
        const recent = g.samples.filter(([t]) => now - t < 80);
        if (recent.length > 1) {
          const [t0, x0] = recent[0];
          const [t1, x1] = recent[recent.length - 1];
          if (t1 - t0 > 0) v = ((x1 - x0) / ((t1 - t0) / 1000)) * RAD_PER_PX;
        }
      }
      const projected = rig.rotY + Math.max(-MAX_PROJECT, Math.min(MAX_PROJECT, v * PROJECT_S));
      rig.face = Math.round(projected / Math.PI);
      // Carry the release speed into the settle only toward the face, and never enough to overshoot
      const gap = rig.face * Math.PI - rig.rotY;
      const toward = Math.sign(gap) === Math.sign(v) ? v : 0;
      rig.velY = Math.sign(toward) * Math.min(Math.abs(toward), SETTLE_W * Math.abs(gap));
      rig.velX = 0;
      rig.dragging = false;
      el.removeAttribute("data-dragging");
      if (el.hasPointerCapture(g.id)) el.releasePointerCapture(g.id);
      rig.invalidate();
    };

    const onDown = (e: PointerEvent) => {
      if (press || e.button !== 0 || !e.isPrimary || startedIn(e, NO_SPIN)) return;
      press = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        ox: 0,
        oy: 0,
        from: 0,
        turning: false,
        samples: [],
      };
    };
    const onMove = (e: PointerEvent) => {
      const g = press;
      if (!g || e.pointerId !== g.id) return;
      if (!g.turning) {
        const dx = Math.abs(e.clientX - g.x0);
        const dy = Math.abs(e.clientY - g.y0);
        if (dy > SPIN_THRESHOLD && dy >= dx) press = null; // a vertical drag: never a turn
        if (dx <= SPIN_THRESHOLD || dx <= dy) return;
        // Deliberate: measure from here so the phone doesn't jump by the threshold
        g.turning = true;
        g.ox = e.clientX;
        g.oy = e.clientY;
        g.from = rig.rotY;
        rig.dragging = true;
        rig.velY = rig.velX = 0;
        el.setAttribute("data-dragging", "");
        el.setPointerCapture(g.id);
      }
      rig.rotY = g.from + (e.clientX - g.ox) * RAD_PER_PX;
      rig.rotX = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, (e.clientY - g.oy) * RAD_PER_PX));
      const now = performance.now();
      g.samples.push([now, e.clientX]);
      if (g.samples.length > 12) g.samples.shift();
      rig.invalidate();
    };
    const onUp = (e: PointerEvent) => {
      if (press && e.pointerId === press.id) end(true);
    };
    const onCancel = (e: PointerEvent) => {
      if (press && e.pointerId === press.id) end(false);
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [stage, rig]);

  return (
    <Fallback onError={onError}>
      <Canvas
        className="stage-canvas"
        frameloop="demand"
        dpr={[1, 2]}
        eventSource={stage as RefObject<HTMLElement>}
        eventPrefix="client"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ fov: 30, position: [0, 0, 30] }}
        onCreated={({ invalidate, gl }) => {
          rig.invalidate = invalidate;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener("webglcontextlost", onError);
        }}
        aria-hidden
      >
        <CameraRig phonePx={hostSize.phonePx} offset={offset} />
        <ambientLight intensity={0.18} />
        {/* key + rim */}
        <directionalLight position={[4, 6, 8]} intensity={0.9} />
        <directionalLight position={[-6, 2, -6]} intensity={0.8} />
        {/*
          Studio for the metal. A 45° chamfer seen from the front mirrors what is beside the phone,
          and a flat side wall mirrors what is behind it, so: thin bright strips left and right make
          the crisp line along each chamfer; strips behind light the side walls; a soft box above
          gives the top edge and the glass their sheen; low fills keep the back from going flat.
        */}
        <Environment resolution={512} frames={1}>
          <Lightformer form="rect" intensity={12} position={[-8, 0.5, 1.6]} rotation-y={Math.PI / 2} scale={[0.6, 16, 1]} />
          <Lightformer form="rect" intensity={9} position={[8, -0.5, 1.6]} rotation-y={-Math.PI / 2} scale={[0.6, 16, 1]} />
          <Lightformer form="rect" intensity={3} position={[-2.6, 0, -8]} scale={[0.9, 16, 1]} />
          <Lightformer form="rect" intensity={2.4} position={[2.8, 0, -8]} scale={[0.9, 16, 1]} />
          <Lightformer form="rect" intensity={2.2} position={[0, 8, 1]} rotation-x={Math.PI / 2} scale={[10, 0.5, 1]} />
          <Lightformer form="rect" intensity={1.4} position={[0, 6, 6]} rotation-x={-Math.PI / 5} scale={[12, 3, 1]} />
          {/* Off-centre softbox in front: a soft gradient across the back and the glass */}
          <Lightformer form="rect" intensity={1.6} position={[-3.5, 4, 8]} scale={[7, 6, 1]} />
          <Lightformer form="rect" intensity={0.25} position={[0, -2, 9]} scale={[14, 8, 1]} />
          <Lightformer form="rect" intensity={0.35} position={[0, -8, 0]} rotation-x={-Math.PI / 2} scale={[14, 14, 1]} />
        </Environment>
        {/* Until the model arrives the CSS phone stays on screen (the live screen moves over on mount) */}
        <Suspense fallback={null}>
          <Device
            rig={rig}
            onHost={onHost}
            portal={stage}
            hostSize={hostSize}
            onLanded={onLanded}
            stage={stage}
          />
        </Suspense>
        <ContactShadows position={[0, -PHONE_H / 2 - 0.35, 0]} scale={[9, 3]} blur={2.6} far={3} opacity={0.42} resolution={256} />
      </Canvas>
    </Fallback>
  );
}

export { newRig };
