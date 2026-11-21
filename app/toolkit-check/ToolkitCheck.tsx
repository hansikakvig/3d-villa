"use client";

import dynamic from "next/dynamic";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Lightformer } from "@react-three/drei";
import { useControls } from "leva";
import { ProgressiveModel, PerformanceGuard, Effects, DevPanel, LazyCanvas, useQuality } from "@/components/three-kit";

const PannellumViewer = dynamic(() => import("@/components/three-kit/PannellumViewer"), { ssr: false });

function Scene({ tier }: { tier: "low" | "medium" | "high" }) {
  const { rotate, bloom } = useControls("Toolkit", { rotate: true, bloom: true });
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 3]} intensity={2} castShadow />
      {/* self-hosted studio environment (no HDR download) */}
      <Environment resolution={256}>
        <Lightformer intensity={2} position={[0, 5, -5]} scale={[10, 3, 1]} />
        <Lightformer intensity={1} color="#cfe3ee" position={[-5, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 4, 1]} />
      </Environment>
      <ProgressiveModel url="/models/_test-villa-block.glb" position={[0, 1, 0]} placeholderSize={2} />
      <mesh position={[2.4, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 16]} />
        <meshStandardMaterial color="#f3d9a4" emissive="#f3d9a4" emissiveIntensity={2} />
      </mesh>
      <ContactShadows position={[0, 0, 0]} opacity={0.5} blur={2.5} scale={10} />
      <OrbitControls autoRotate={rotate} makeDefault />
      <PerformanceGuard />
      {bloom && <Effects tier={tier} />}
    </>
  );
}

export default function ToolkitCheck() {
  const q = useQuality();
  return (
    <main style={{ minHeight: "100vh", background: "#101a14", color: "#fff", fontFamily: "system-ui, sans-serif", padding: 16 }}>
      <DevPanel />
      <h1 style={{ fontSize: 20, margin: "8px 0" }}>Touchwood Bliss · 3D toolkit check</h1>
      <p style={{ fontSize: 13, opacity: 0.7 }}>
        Quality tier: <b>{q.tier}</b> · mobile: {String(q.isMobile)} · reduced motion: {String(q.reducedMotion)} · add <code>?debug</code> for Leva, <code>?quality=low</code> to force a tier
      </p>
      <section style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", marginTop: 16 }}>
        <div>
          <h2 style={{ fontSize: 14, opacity: 0.8 }}>GLB (Meshopt) · progressive LOD · postprocessing</h2>
          <div style={{ height: 380, borderRadius: 12, overflow: "hidden", background: "#1b2a21" }}>
            <Canvas shadows={q.shadows} dpr={q.dpr} gl={{ antialias: !q.postprocessing }} camera={{ position: [4, 3, 5], fov: 45 }}>
              <Scene tier={q.tier} />
            </Canvas>
          </div>
        </div>
        <div>
          <h2 style={{ fontSize: 14, opacity: 0.8 }}>Pannellum 360° (lazy-mounted)</h2>
          <LazyCanvas className="pano" fallback={<div style={{ height: 380 }} />}>
            <PannellumViewer
              className="tb-pano"
              scenes={[
                { id: "a", title: "Test panorama", panorama: "/pano/_test-grid.jpg", hotSpots: [{ pitch: -5, yaw: 90, text: "Go to scene B", sceneId: "b" }] },
                { id: "b", title: "Scene B", panorama: "/pano/_test-grid.jpg", yaw: 180, hotSpots: [{ pitch: -5, yaw: 0, text: "Back to A", sceneId: "a" }] },
              ]}
            />
          </LazyCanvas>
          <style>{`.tb-pano{height:380px;border-radius:12px;overflow:hidden}`}</style>
        </div>
      </section>
    </main>
  );
}
