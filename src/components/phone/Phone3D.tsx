"use client";

import { Component, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Html, Lightformer } from "@react-three/drei";
import * as THREE from "three";

import { useOS } from "@/lib/store";

/*
 * Optional 3D phone (NEXT_PUBLIC_ENABLE_3D=true, desktop, WebGL, motion allowed).
 * The body is drawn here; the live OS screen is portalled into the <Html transform>
 * host by <Phone>, so it stays real, sharp, clickable DOM.
 */

// Logical sizes in CSS px, matching the CSS phone at --phone-h: 900px
export const SCREEN_W = 385;
export const SCREEN_H = 869;
const PX = 4 / 400; // drei: distanceFactor 4 → 1 css px = 0.01 world units
const PHONE_H = 900 * PX;
const PHONE_W = 900 * (9 / 19.5) * PX;
const DEPTH = 0.42;
const RADIUS = 900 * 0.075 * PX;
const RIM = 900 * 0.0045 * PX;
const BEVEL = 0.07;
const MAX_TILT = THREE.MathUtils.degToRad(6);

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

function readFinish() {
  const css = getComputedStyle(document.documentElement);
  return {
    color: css.getPropertyValue("--accent").trim() || "#ffb800",
    deep: css.getPropertyValue("--accent-deep").trim() || "#c98a00",
  };
}

function Body({
  onHost,
  pointer,
  portal,
}: {
  onHost: (el: HTMLDivElement | null) => void;
  pointer: React.RefObject<{ x: number; y: number; over: boolean }>;
  portal: React.RefObject<HTMLDivElement | null>;
}) {
  const group = useRef<THREE.Group>(null);
  const metal = useRef<THREE.MeshPhysicalMaterial>(null);
  const finish = useOS((s) => s.finish);
  const invalidate = useThree((s) => s.invalidate);
  const arrive = useRef(0);
  const deep = useMemo(() => (finish ? readFinish().deep : ""), [finish]);

  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(
      roundedRect(PHONE_W - BEVEL * 2, PHONE_H - BEVEL * 2, RADIUS - BEVEL),
      { depth: DEPTH - BEVEL * 2, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 8, curveSegments: 40 },
    );
    g.center();
    return g;
  }, []);
  const glass = useMemo(() => new THREE.ShapeGeometry(roundedRect(PHONE_W - RIM * 2, PHONE_H - RIM * 2, RADIUS - RIM), 40), []);
  useEffect(() => () => (body.dispose(), glass.dispose()), [body, glass]);

  // Finish colour follows the swatches
  useEffect(() => {
    const { color } = readFinish();
    metal.current?.color.set(color);
    invalidate();
  }, [finish, invalidate]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const p = pointer.current;
    // Squares up to the visitor while they use the screen
    const tx = p.over ? 0 : -p.y * MAX_TILT;
    const ty = p.over ? 0 : p.x * MAX_TILT;
    const k = 1 - Math.exp(-delta * 6);
    g.rotation.x += (tx - g.rotation.x) * k;
    g.rotation.y += (ty - g.rotation.y) * k;
    arrive.current = Math.min(1, arrive.current + delta / 0.9);
    const e = 1 - Math.pow(1 - arrive.current, 3);
    g.position.y = (1 - e) * -0.24;
    g.scale.setScalar(0.96 + 0.04 * e);
    const moving = Math.abs(tx - g.rotation.x) > 1e-4 || Math.abs(ty - g.rotation.y) > 1e-4 || arrive.current < 1;
    if (moving) state.invalidate();
  });

  return (
    <group ref={group}>
      <mesh geometry={body}>
        <meshPhysicalMaterial ref={metal} metalness={0.9} roughness={0.26} clearcoat={0.7} clearcoatRoughness={0.2} />
      </mesh>
      <mesh geometry={glass} position-z={DEPTH / 2 + 0.002}>
        <meshStandardMaterial color="#050505" roughness={0.12} metalness={0.1} />
      </mesh>
      {/* side buttons */}
      {[
        [-1, 0.33, 0.032],
        [-1, 0.26, 0.058],
        [-1, 0.185, 0.058],
        [1, 0.23, 0.09],
      ].map(([side, y, h], i) => (
        <mesh key={i} position={[side * (PHONE_W / 2 + 0.012), PHONE_H * (0.5 - y), 0]}>
          <boxGeometry args={[0.04, PHONE_H * h, DEPTH * 0.45]} />
          <meshPhysicalMaterial color={deep} metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* A fixed portal target: drei rebuilds (and empties) its root if the default target changes after mount */}
      <Html transform portal={portal as React.RefObject<HTMLElement>} distanceFactor={4} position-z={DEPTH / 2 + 0.004} zIndexRange={[20, 0]}>
        <div
          ref={onHost}
          style={{ width: SCREEN_W, height: SCREEN_H, ["--phone-h" as string]: "900px" }}
        />
      </Html>
    </group>
  );
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

export default function Phone3D({ onHost, onError }: { onHost: (el: HTMLDivElement | null) => void; onError: () => void }) {
  const pointer = useRef({ x: 0, y: 0, over: false });
  const invalidateRef = useRef<() => void>(() => {});
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.current.over = !!(e.target as Element | null)?.closest?.("[data-screen]");
      invalidateRef.current();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Fallback onError={onError}>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 30, position: [0, 0, (PHONE_H / 0.92 / 2) / Math.tan(THREE.MathUtils.degToRad(15))] }}
          onCreated={({ invalidate, gl }) => {
            invalidateRef.current = invalidate;
            gl.domElement.addEventListener("webglcontextlost", onError);
          }}
          aria-hidden
        >
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 5, 6]} intensity={1.4} />
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={2.2} position={[0, 6, 4]} scale={[12, 3, 1]} />
            <Lightformer intensity={1.2} position={[-6, 0, 3]} rotation-y={Math.PI / 2} scale={[8, 10, 1]} />
            <Lightformer intensity={0.9} position={[6, -2, 3]} rotation-y={-Math.PI / 2} scale={[8, 6, 1]} />
            <Lightformer intensity={0.6} position={[0, -6, -2]} scale={[10, 2, 1]} />
          </Environment>
          <Body onHost={onHost} pointer={pointer} portal={wrap} />
        </Canvas>
      </Fallback>
    </div>
  );
}
