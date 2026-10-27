"use client";

// Imperative three.js frame-loop code: materials, camera and the shared rig are mutated on purpose.
/* eslint-disable react-hooks/immutability */

import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Html, Lightformer } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import { easing } from "maath";
import * as THREE from "three";

import { FINISH_INFO } from "@/components/studio/FinishSwatches";
import { startedIn } from "@/lib/gesture";
import { useOS } from "@/lib/store";

/*
 * The 3D phone: an original device modelled here in code (no downloaded model). The live OS
 * screen is real DOM, moved into the drei <Html transform> host by <Phone>, so it stays crisp
 * and clickable; `occlude="blending"` lets the body hide it when the back faces the camera.
 *
 * World units: the phone is 9 units tall (≈ 150 mm), 71.5 × 150 × 8.25 mm proportions.
 */

export const PHONE_H = 9;
export const PHONE_W = (PHONE_H * 71.5) / 150;
const DEPTH = (PHONE_H * 8.25) / 150;
const RADIUS = PHONE_H * 0.075;
const BEVEL = 0.09;
/** Screen inset from the outer edge, same ratio as the CSS phone (rim + bezel = 1.7% of height) */
export const SCREEN_INSET = PHONE_H * 0.017;
export const SCREEN_W = PHONE_W - SCREEN_INSET * 2;
export const SCREEN_H = PHONE_H - SCREEN_INSET * 2;
const SCREEN_R = PHONE_H * 0.058;
const FRONT_Z = DEPTH / 2;
const BACK_Z = -DEPTH / 2;

const DEG = Math.PI / 180;
const MAX_TILT = 6 * DEG;
const MAX_PITCH = 25 * DEG;
/** Drag distance (px) for a full turn */
const PX_PER_TURN = 720;
const IDLE_BEFORE_SETTLE = 1.2;

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
  /** Seconds since the last drag release; settles to a face after IDLE_BEFORE_SETTLE */
  idle: number;
  /** Face we are springing to, in radians (null = coasting) */
  target: number | null;
  pointer: { x: number; y: number; over: boolean };
  pressed: number | null;
};

const newRig = (): Rig => ({
  rotY: 0,
  rotX: 0,
  velY: 0,
  velX: 0,
  dragging: false,
  idle: 99,
  target: 0,
  pointer: { x: 0, y: 0, over: false },
  pressed: null,
});

/** Nearest angle ≡ `face` (0 = front, π = back) to `angle`. */
const nearest = (angle: number, face: number) => face + Math.round((angle - face) / (Math.PI * 2)) * Math.PI * 2;
const showingBack = (angle: number) => Math.cos(angle) < 0;

/** Springs `rig` back to the front from wherever it is (tap on back, double-click, R). */
export function resetRig(rig: Rig) {
  rig.target = nearest(rig.rotY, 0);
  rig.idle = IDLE_BEFORE_SETTLE;
}

/* ───────────────────────────── Branding texture ───────────────────────────── */

/** ⚡ CP mark + name, drawn once into a canvas and used as an alpha map (debossed look). */
function useMarkTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 1024;
    const g = c.getContext("2d")!;
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    g.fillStyle = "#fff";
    // Original bolt, drawn as a polygon
    g.save();
    g.translate(256, 470);
    g.beginPath();
    const bolt = [
      [18, -92],
      [-46, 10],
      [-6, 10],
      [-22, 92],
      [46, -14],
      [6, -14],
      [22, -92],
    ];
    bolt.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
    g.restore();
    const family = getComputedStyle(document.body).fontFamily || "sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `800 92px ${family}`;
    g.fillText("CP", 256, 640);
    g.font = `600 30px ${family}`;
    g.globalAlpha = 0.85;
    g.fillText("Chetan Pujari", 256, 930);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }, []);
}

/* ───────────────────────────── The device ───────────────────────────── */

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
  const frame = useRef<THREE.MeshPhysicalMaterial>(null!);
  const back = useRef<THREE.MeshPhysicalMaterial>(null!);
  const trim = useRef<THREE.MeshPhysicalMaterial>(null!);
  const buttons = useRef<(THREE.Mesh | null)[]>([]);
  const finish = useOS((s) => s.finish);
  const mark = useMarkTexture();
  // Make the entrance only if the CSS phone is still waiting for us (first load on desktop).
  const [arrive] = useState(() => document.documentElement.hasAttribute("data-stage-wait"));
  const arrival = useRef({ p: arrive ? 0 : 1, v: 0, landed: !arrive });
  const tilt = useRef({ x: 0, y: 0 });
  const colors = useMemo(
    () => ({ frame: new THREE.Color(), back: new THREE.Color(), trim: new THREE.Color() }),
    [],
  );
  const press = useRef([0, 0, 0, 0]);
  const invalidate = useThree((s) => s.invalidate);

  const geo = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(roundedRect(PHONE_W - BEVEL * 2, PHONE_H - BEVEL * 2, RADIUS - BEVEL), {
      depth: DEPTH - BEVEL * 2,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 8,
      curveSegments: 36,
    });
    body.center();
    const front = new THREE.ShapeGeometry(roundedRect(PHONE_W - BEVEL * 2 + 0.02, PHONE_H - BEVEL * 2 + 0.02, RADIUS - BEVEL), 36);
    const screen = new THREE.ShapeGeometry(roundedRect(SCREEN_W, SCREEN_H, SCREEN_R), 24);
    // Original camera pill: vertical capsule, two lenses + a flash dot
    const pill = new THREE.ExtrudeGeometry(roundedRect(1.18, 2.42, 0.59), {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 4,
      curveSegments: 32,
    });
    const markPlane = new THREE.PlaneGeometry(1.6, 3.2);
    return { body, front, screen, pill, markPlane };
  }, []);
  useEffect(
    () => () => {
      Object.values(geo).forEach((g) => g.dispose());
      mark.dispose();
    },
    [geo, mark],
  );

  // Finish colours: start where we are and blend over ~400 ms (see useFrame).
  const target = useMemo(() => {
    const f = FINISH_INFO[finish];
    return {
      frame: new THREE.Color(f.color),
      back: new THREE.Color(f.color).lerp(new THREE.Color(f.deep), 0.35),
      trim: new THREE.Color(f.deep),
    };
  }, [finish]);
  const firstColor = useRef(true);
  useEffect(() => {
    if (firstColor.current) {
      colors.frame.copy(target.frame);
      colors.back.copy(target.back);
      colors.trim.copy(target.trim);
      firstColor.current = false;
    }
    invalidate();
  }, [target, colors, invalidate]);

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

    // Drag inertia → settle on the nearest face once the visitor lets go for a moment.
    if (!rig.dragging) {
      rig.idle += dt;
      if (rig.target === null) {
        rig.rotY += rig.velY * dt;
        rig.rotX += rig.velX * dt;
        const decay = Math.exp(-dt * 2.6);
        rig.velY *= decay;
        rig.velX *= decay;
        // Back showing once it slows: settle on the back. Front: spring home after a short pause.
        const slow = Math.abs(rig.velY) < 0.35;
        if (slow && showingBack(rig.rotY)) rig.target = nearest(rig.rotY, Math.PI);
        else if (rig.idle > IDLE_BEFORE_SETTLE && !showingBack(rig.rotY)) rig.target = nearest(rig.rotY, 0);
        moving = true;
      } else {
        // Rotation spring (damping ratio ≈ 0.8): carries the release velocity, no hard stop.
        const k = 70;
        const c = 13.5;
        for (let i = 0; i < 4; i++) {
          const h = dt / 4;
          rig.velY += (-k * (rig.rotY - rig.target) - c * rig.velY) * h;
          rig.rotY += rig.velY * h;
          rig.velX += (-k * rig.rotX - c * rig.velX) * h;
          rig.rotX += rig.velX * h;
        }
        if (Math.abs(rig.rotY - rig.target) > 1e-4 || Math.abs(rig.velY) > 1e-3 || Math.abs(rig.rotX) > 1e-4) moving = true;
        else {
          rig.rotY = rig.target;
          rig.rotX = 0;
          rig.velY = rig.velX = 0;
        }
      }
    } else moving = true;

    // Pointer parallax (critically damped); squares up while the visitor uses the screen.
    const p = rig.pointer;
    const calm = p.over || rig.dragging || showingBack(rig.rotY);
    moving = easing.damp(tilt.current, "x", calm ? 0 : p.y * MAX_TILT, 0.22, dt) || moving;
    moving = easing.damp(tilt.current, "y", calm ? 0 : p.x * MAX_TILT, 0.22, dt) || moving;

    g.rotation.y = rig.rotY + tilt.current.y + away * -18 * DEG;
    g.rotation.x = rig.rotX + tilt.current.x + away * 8 * DEG;
    g.position.y = away * -(40 / hostSize.phonePx) * PHONE_H;

    // Finish colour blend
    moving = easing.dampC(colors.frame, target.frame, 0.12, dt) || moving;
    moving = easing.dampC(colors.back, target.back, 0.12, dt) || moving;
    moving = easing.dampC(colors.trim, target.trim, 0.12, dt) || moving;
    frame.current.color.copy(colors.frame);
    back.current.color.copy(colors.back);
    trim.current.color.copy(colors.trim);

    // Side buttons: press in, spring out
    press.current.forEach((v, i) => {
      const want = rig.pressed === i ? 1 : 0;
      const next = v + (want - v) * (1 - Math.exp(-dt * (want ? 40 : 18)));
      press.current[i] = Math.abs(next - want) < 1e-3 ? want : next;
      const b = buttons.current[i];
      if (b) b.position.x = b.userData.x - Math.sign(b.userData.x) * press.current[i] * 0.025;
      if (press.current[i] !== want) moving = true;
    });

    // The screen is only interactive while it faces the camera.
    const facing = !showingBack(g.rotation.y);
    if (host.current && host.current.inert === facing) host.current.inert = !facing;
    const s = stage.current;
    if (s) {
      s.dataset.roty = String(Math.round((rig.rotY * 180) / Math.PI));
      s.dataset.face = facing ? "front" : "back";
    }

    if (moving) state.invalidate();
  });

  const buttonSpecs: [side: number, y: number, h: number][] = [
    [-1, 0.27, 0.075],
    [-1, 0.17, 0.075],
    [1, 0.22, 0.12],
    [1, 0.05, 0.05],
  ];

  const pressButton = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    rig.pressed = i;
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
      <mesh geometry={geo.body}>
        {/* group 0 = caps (back glass), group 1 = sides + bevel (metal frame) */}
        <meshPhysicalMaterial ref={back} attach="material-0" metalness={0.35} roughness={0.35} clearcoat={1} clearcoatRoughness={0.22} sheen={0.4} sheenRoughness={0.6} />
        <meshPhysicalMaterial ref={frame} attach="material-1" metalness={0.9} roughness={0.25} clearcoat={0.4} clearcoatRoughness={0.2} />
      </mesh>

      {/* Front glass + bezel */}
      <mesh geometry={geo.front} position-z={FRONT_Z + 0.001}>
        <meshPhysicalMaterial color="#030303" roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>

      {/* Back: camera pill (top-left as seen from behind = +x here) */}
      <group position={[PHONE_W / 2 - 0.42 - 0.59, PHONE_H / 2 - 0.42 - 1.21, BACK_Z]} rotation-y={Math.PI}>
        <mesh geometry={geo.pill} position-z={-0.02}>
          <meshPhysicalMaterial ref={trim} metalness={0.6} roughness={0.22} clearcoat={1} clearcoatRoughness={0.1} />
        </mesh>
        {[0.52, -0.38].map((y) => (
          <group key={y} position={[0, y, 0.12]} rotation-x={Math.PI / 2}>
            <mesh>
              <cylinderGeometry args={[0.42, 0.44, 0.08, 48]} />
              <meshPhysicalMaterial color="#1b1b1e" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position-y={0.045} rotation-x={-Math.PI / 2}>
              <torusGeometry args={[0.34, 0.035, 12, 48]} />
              <meshPhysicalMaterial color="#d9d9de" metalness={1} roughness={0.18} />
            </mesh>
            <mesh position-y={0.05}>
              <cylinderGeometry args={[0.29, 0.29, 0.02, 48]} />
              <meshPhysicalMaterial color="#000000" roughness={0.04} metalness={0.1} clearcoat={1} clearcoatRoughness={0} iridescence={0.35} iridescenceIOR={1.5} envMapIntensity={0.8} />
            </mesh>
            <mesh position={[0.08, 0.062, -0.08]}>
              <circleGeometry args={[0.06, 24]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.98, 0.12]}>
          <circleGeometry args={[0.1, 32]} />
          <meshPhysicalMaterial color="#fff6dd" emissive="#2a2410" roughness={0.3} />
        </mesh>
      </group>

      {/* Back: debossed ⚡ CP mark — a darker offset copy reads as the recess edge */}
      <group position-z={BACK_Z - 0.002} rotation-y={Math.PI}>
        <mesh geometry={geo.markPlane} position={[0.012, -0.95, 0]}>
          <meshBasicMaterial color="#000000" alphaMap={mark} transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh geometry={geo.markPlane} position={[0, -0.94, 0.001]}>
          <meshPhysicalMaterial color="#f4f1ea" alphaMap={mark} transparent metalness={1} roughness={0.12} opacity={0.85} depthWrite={false} />
        </mesh>
      </group>

      {/* Side buttons (original pills) */}
      {buttonSpecs.map(([side, y, h], i) => {
        const x = side * (PHONE_W / 2 + 0.006);
        return (
          <mesh
            key={i}
            ref={(m) => {
              buttons.current[i] = m;
              if (m) m.userData.x = x;
            }}
            position={[x, PHONE_H * (0.5 - y), 0]}
            rotation-z={0}
            onPointerDown={pressButton(i)}
          >
            <capsuleGeometry args={[0.05, PHONE_H * h, 6, 16]} />
            <meshPhysicalMaterial color={FINISH_INFO[finish].deep} metalness={0.9} roughness={0.28} />
          </mesh>
        );
      })}

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
          style={{ width: hostSize.w, height: hostSize.h, ["--phone-h" as string]: `${hostSize.phonePx}px` }}
        />
      </Html>
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
  const invalidateRef = useRef<() => void>(() => {});

  // Pointer parallax + "is the pointer over the screen"
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      rig.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      rig.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      rig.pointer.over = !!(e.target as Element | null)?.closest?.("[data-screen]");
      invalidateRef.current();
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key.toLowerCase() !== "r" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t?.closest("input, textarea, [contenteditable], [data-screen]")) return;
      resetRig(rig);
      invalidateRef.current();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [rig]);

  // Drag on the stage (never on the screen): spin with inertia.
  const start = useRef({ y: 0, x: 0 });
  useDrag(
    (s) => {
      const { first, last, tap, movement, event, cancel } = s;
      if (first && startedIn(event, "[data-screen], button, a, input")) {
        cancel();
        return;
      }
      if (tap) {
        if (showingBack(rig.rotY)) resetRig(rig);
        invalidateRef.current();
        return;
      }
      if (first) {
        start.current = { y: rig.rotY, x: rig.rotX };
        rig.dragging = true;
        rig.target = null;
        stage.current?.setAttribute("data-dragging", "");
      }
      const k = (Math.PI * 2) / PX_PER_TURN;
      rig.rotY = start.current.y + movement[0] * k;
      const pitch = start.current.x + movement[1] * k;
      rig.rotX = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
      rig.velY = s.velocity[0] * s.direction[0] * 1000 * k;
      rig.velX = rig.rotX === pitch ? s.velocity[1] * s.direction[1] * 1000 * k : 0;
      if (last) {
        rig.dragging = false;
        rig.idle = 0;
        stage.current?.removeAttribute("data-dragging");
      }
      invalidateRef.current();
    },
    { target: stage, threshold: 6, filterTaps: true, pointer: { capture: true }, eventOptions: { passive: true } },
  );

  // Double-click empty stage space: back to the front.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onDbl = (e: MouseEvent) => {
      if (startedIn(e, "[data-screen], button, a")) return;
      resetRig(rig);
      invalidateRef.current();
    };
    el.addEventListener("dblclick", onDbl);
    return () => el.removeEventListener("dblclick", onDbl);
  }, [stage, rig]);

  return (
    <Fallback onError={onError}>
      <Canvas
        className="stage-canvas"
        frameloop="demand"
        dpr={[1, 2]}
        eventSource={stage as RefObject<HTMLElement>}
        eventPrefix="client"
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ fov: 30, position: [0, 0, 30] }}
        onCreated={({ invalidate, gl }) => {
          invalidateRef.current = invalidate;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.domElement.addEventListener("webglcontextlost", onError);
        }}
        aria-hidden
      >
        <CameraRig phonePx={hostSize.phonePx} offset={offset} />
        <ambientLight intensity={0.25} />
        {/* key + rim */}
        <directionalLight position={[4, 6, 8]} intensity={1.3} />
        <directionalLight position={[-6, 2, -6]} intensity={1.1} />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={2.4} position={[0, 7, 5]} scale={[14, 3, 1]} />
          <Lightformer intensity={1.4} position={[-7, 0, 4]} rotation-y={Math.PI / 2} scale={[9, 12, 1]} />
          <Lightformer intensity={1.1} position={[7, -1, 4]} rotation-y={-Math.PI / 2} scale={[9, 8, 1]} />
          <Lightformer intensity={0.9} position={[0, 2, -8]} rotation-y={Math.PI} scale={[12, 6, 1]} />
          <Lightformer intensity={0.5} position={[0, -7, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
        </Environment>
        <Device
          rig={rig}
          onHost={onHost}
          portal={stage}
          hostSize={hostSize}
          onLanded={onLanded}
          stage={stage}
        />
        <ContactShadows position={[0, -PHONE_H / 2 - 0.35, 0]} scale={[9, 3]} blur={2.6} far={3} opacity={0.42} resolution={256} />
      </Canvas>
    </Fallback>
  );
}

export { newRig };
