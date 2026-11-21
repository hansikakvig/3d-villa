"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, Preload } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import ResortMasterplan from "./ResortMasterplan";
import CameraController from "./CameraController";
import LocationHotspot from "./LocationHotspot";
import { LOCATIONS, add, getLocation } from "./data";
import { useTour } from "./store";

/** Soft monsoon-haze gradient sky (cheap, no shader). */
function SkyDome() {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(2400, 32, 16);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const horizon = new THREE.Color("#e3e8e2"), zenith = new THREE.Color("#7fa6c6"), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = Math.max(0, pos.getY(i) / 2400);
      c.copy(horizon).lerp(zenith, Math.pow(t, 0.55));
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo} renderOrder={-1}>
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Hotspots() {
  const { mode, selected, select, hover, setViewpoint, viewpoint } = useTour();
  if (mode === "loading" || mode === "intro" || mode === "entering" || mode === "interior") return null;

  if (mode === "villa") {
    const loc = getLocation(selected);
    if (!loc?.viewpoints) return null;
    return (
      <>
        {loc.viewpoints.slice(1).map((vp, i) => viewpoint === i + 1 ? null : (
          <LocationHotspot
            key={vp.label}
            small
            position={add(loc.position, add(vp.marker ?? vp.target, [0, 2.2, 0]))}
            label={vp.label}
            active={viewpoint === i + 1}
            onClick={() => setViewpoint(i + 1)}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {LOCATIONS.map((l) => (
        <LocationHotspot
          key={l.id}
          position={add(l.position, [0, l.kind === "villa" ? 7.5 : 5.5, 0])}
          label={l.name.replace(" & Nature Lounge", "")}
          active={selected === l.id}
          onClick={() => select(l.id)}
          onHover={(h) => hover(h ? l.id : null)}
        />
      ))}
    </>
  );
}

export default function ResortScene({ onReady }: { onReady: () => void }) {
  const mode = useTour((s) => s.mode);
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={mode === "interior" ? "never" : "always"}
      camera={{ fov: 42, near: 0.5, far: 5000, position: [150, 120, 210] }}
      gl={{ antialias: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95 }}
      onCreated={() => requestAnimationFrame(() => onReady())}
      onPointerMissed={() => undefined}
    >
      <color attach="background" args={["#d3dcd8"]} />
      <fog attach="fog" args={["#d3dcd8", 140, 760]} />
      <SkyDome />
      <hemisphereLight args={["#e9f1ff", "#4a5a35", 0.65]} />
      <directionalLight
        position={[90, 110, 70]}
        intensity={2.4}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-far={400}
        shadow-bias={-0.0004}
      />
      <ResortMasterplan />
      <Hotspots />
      <CameraController />
      <AdaptiveDpr pixelated={false} />
      <Preload all />
    </Canvas>
  );
}
