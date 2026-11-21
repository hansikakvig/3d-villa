"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real photograph + AI depth map rendered as a 2.5D "3D photo".
 * The image shifts by depth as the visitor moves the cursor, drags, or tilts the phone.
 */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform vec2 uOffset;     // parallax direction (-1..1)
  uniform vec2 uCover;      // cover-fit scale
  uniform float uZoom;
  uniform float uFocus;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec2 uv = (vUv - 0.5) * uCover / uZoom + 0.5;
    vec2 p = uv;
    // a few relaxation steps reduce stretching at depth edges
    for (int i = 0; i < 5; i++) {
      float d = texture2D(uDepth, p).r;
      p = uv + uOffset * (d - uFocus);
    }
    p = clamp(p, 0.001, 0.999);
    vec4 c = texture2D(uMap, p);
    gl_FragColor = vec4(c.rgb, uOpacity);
    #include <colorspace_fragment>
  }
`;

type Input = { x: number; y: number };

function Plane({ src, depth, input, reduced, strength }: { src: string; depth: string; input: React.RefObject<Input>; reduced: boolean; strength: number }) {
  const [map, depthMap] = useTexture([src, depth]);
  const size = useThree((s) => s.size);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const cur = useRef({ x: 0, y: 0, t: 0, fade: 0 });

  useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.minFilter = THREE.LinearFilter;
    map.generateMipmaps = false;
    depthMap.minFilter = THREE.LinearFilter;
    depthMap.generateMipmaps = false;
  }, [map, depthMap]);

  const uniforms = useMemo(
    () => ({
      uMap: { value: map },
      uDepth: { value: depthMap },
      uOffset: { value: new THREE.Vector2() },
      uCover: { value: new THREE.Vector2(1, 1) },
      uZoom: { value: 1.08 },
      uFocus: { value: 0.45 },
      uOpacity: { value: 0 },
    }),
    [map, depthMap],
  );

  useFrame((_, dt) => {
    const m = mat.current;
    if (!m) return;
    const img = map.image as { width: number; height: number };
    const ia = img.width / img.height, va = size.width / size.height;
    m.uniforms.uCover.value.set(va > ia ? 1 : va / ia, va > ia ? ia / va : 1);

    const c = cur.current;
    c.t += dt;
    c.fade = Math.min(1, c.fade + dt * 1.6);
    const idle = reduced ? { x: 0, y: 0 } : { x: Math.sin(c.t * 0.35) * 0.35, y: Math.sin(c.t * 0.23) * 0.18 };
    const inp = input.current ?? { x: 0, y: 0 };
    const tx = inp.x !== 0 || inp.y !== 0 ? inp.x : idle.x;
    const ty = inp.x !== 0 || inp.y !== 0 ? inp.y : idle.y;
    const k = 1 - Math.pow(0.0015, dt);
    c.x += (tx - c.x) * k;
    c.y += (ty - c.y) * k;
    m.uniforms.uOffset.value.set(-c.x * strength, c.y * strength * 0.6);
    // slow "step into the room" dolly
    m.uniforms.uZoom.value = reduced ? 1.08 : 1.08 + Math.min(c.t, 14) * 0.004;
    m.uniforms.uOpacity.value = c.fade;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

export default function DepthPhoto({ src, depth, strength = 0.035, reduced = false }: { src: string; depth: string; strength?: number; reduced?: boolean }) {
  const input = useRef<Input>({ x: 0, y: 0 });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let idleTimer = 0;
    const settle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => (input.current = { x: 0, y: 0 }), 2500);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      input.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1 || 0.0001, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
      settle();
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      input.current = { x: THREE.MathUtils.clamp(e.gamma / 25, -1, 1) || 0.0001, y: THREE.MathUtils.clamp((e.beta - 45) / 25, -1, 1) };
      settle();
    };
    el.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return (
    <div ref={box} className="absolute inset-0 touch-none">
      <Canvas dpr={[1, 2]} gl={{ antialias: false, alpha: true }} flat linear={false} frameloop="always">
        <Plane key={src} src={src} depth={depth} input={input} reduced={reduced} strength={strength} />
      </Canvas>
    </div>
  );
}

/** iOS needs an explicit permission prompt for tilt. Call from a user gesture. */
export async function requestTiltPermission() {
  const D = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as unknown as { requestPermission?: () => Promise<string> } | undefined;
  if (D?.requestPermission) {
    try {
      await D.requestPermission();
    } catch {
      /* user declined: cursor/drag still works */
    }
  }
}
