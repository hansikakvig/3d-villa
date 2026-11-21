"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Image from "next/image";
import { Location, Room } from "./data";
import { useTour } from "./store";

const R = 50;

/** Labelled equirectangular placeholder, drawn on a canvas. Used until real 360° photography is supplied. */
function makePlaceholder(room: Room, villa: string) {
  const W = 4096, H = 2048;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  const { wall, floor, ceiling, accent } = room.palette;
  const outdoor = room.kind === "outdoor";

  // ceiling / sky
  let gr = g.createLinearGradient(0, 0, 0, H * 0.38);
  gr.addColorStop(0, outdoor ? "#a9c9de" : ceiling);
  gr.addColorStop(1, outdoor ? "#e6eee8" : ceiling);
  g.fillStyle = gr;
  g.fillRect(0, 0, W, H * 0.38);
  if (!outdoor) {
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.lineWidth = 10;
    for (let x = 0; x < W; x += 256) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, H * 0.38);
      g.stroke();
    }
  }
  // walls / horizon
  gr = g.createLinearGradient(0, H * 0.38, 0, H * 0.62);
  gr.addColorStop(0, outdoor ? "#6d8a5a" : wall);
  gr.addColorStop(1, outdoor ? "#4f6e42" : wall);
  g.fillStyle = gr;
  g.fillRect(0, H * 0.38, W, H * 0.24);
  if (outdoor) {
    // distant ridges
    g.fillStyle = "#7d8f86";
    g.beginPath();
    g.moveTo(0, H * 0.5);
    for (let x = 0; x <= W; x += 32) g.lineTo(x, H * 0.43 + Math.sin(x * 0.003) * 36 + Math.sin(x * 0.0105) * 16);
    g.lineTo(W, H * 0.5);
    g.fill();
  } else {
    // windows framing greenery
    for (let i = 0; i < 4; i++) {
      const x = i * (W / 4) - 220 + (i === 0 ? 220 : 0);
      gr = g.createLinearGradient(0, H * 0.4, 0, H * 0.6);
      gr.addColorStop(0, "#bcd6c6");
      gr.addColorStop(1, "#5f7f4f");
      g.fillStyle = gr;
      g.fillRect(x, H * 0.4, 440, H * 0.19);
      g.strokeStyle = accent;
      g.lineWidth = 16;
      g.strokeRect(x, H * 0.4, 440, H * 0.19);
    }
  }
  // floor / ground
  gr = g.createLinearGradient(0, H * 0.62, 0, H);
  gr.addColorStop(0, floor);
  gr.addColorStop(1, "#2b2219");
  g.fillStyle = gr;
  g.fillRect(0, H * 0.62, W, H * 0.38);
  g.strokeStyle = "rgba(0,0,0,0.12)";
  g.lineWidth = 3;
  for (let y = H * 0.62; y < H; y += 52) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(W, y);
    g.stroke();
  }
  // labels in four directions
  g.textAlign = "center";
  for (let i = 0; i < 4; i++) {
    const cx = i * (W / 4) + W / 8;
    g.fillStyle = "rgba(19,32,26,0.72)";
    g.fillRect(cx - 300, H * 0.5 - 70, 600, 120);
    g.fillStyle = "#f3d9a4";
    g.font = "600 40px Georgia, serif";
    g.fillText(`${villa} · ${room.name}`, cx, H * 0.5 - 16);
    g.fillStyle = "#ffffff";
    g.font = "24px sans-serif";
    g.fillText("Illustrative placeholder — 360° photography pending", cx, H * 0.5 + 28);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Panorama({ room, villa }: { room: Room; villa: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    let disposed = false;
    let t: THREE.Texture;
    const finish = (x: THREE.Texture) => {
      x.wrapS = THREE.RepeatWrapping;
      x.repeat.x = -1; // viewed from inside the sphere
      x.anisotropy = gl.capabilities.getMaxAnisotropy();
      if (!disposed) setTex(x);
      t = x;
    };
    if (room.pano) {
      new THREE.TextureLoader().load(room.pano, (x) => {
        x.colorSpace = THREE.SRGBColorSpace;
        finish(x);
      }, undefined, () => finish(makePlaceholder(room, villa)));
    } else finish(makePlaceholder(room, villa));
    return () => {
      disposed = true;
      t?.dispose();
    };
  }, [room, villa, gl]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[R, 64, 40]} />
        <meshBasicMaterial map={tex ?? undefined} side={THREE.BackSide} color={tex ? "#ffffff" : "#222"} toneMapped={false} />
      </mesh>
    </group>
  );
}

const linkPos = (yawDeg: number, pitchDeg = -8) => {
  const yaw = THREE.MathUtils.degToRad(yawDeg), pitch = THREE.MathUtils.degToRad(pitchDeg), d = R * 0.6;
  return new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch) * d, Math.sin(pitch) * d, -Math.cos(yaw) * Math.cos(pitch) * d);
};

/** Projects room-link hotspots onto a DOM layer every frame. */
function Projector({ room, els }: { room: Room; els: React.RefObject<(HTMLElement | null)[]> }) {
  const pts = useMemo(() => room.links.map((l) => linkPos(l.yaw, l.pitch)), [room]);
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    pts.forEach((p, i) => {
      const el = els.current?.[i];
      if (!el) return;
      v.copy(p).project(camera);
      const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
      el.style.opacity = visible ? "1" : "0";
      el.style.pointerEvents = visible ? "auto" : "none";
      el.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px)`;
    });
  });
  return null;
}

function FovZoom() {
  const { camera, gl } = useThree();
  useEffect(() => {
    const el = gl.domElement;
    const cam = camera as THREE.PerspectiveCamera;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cam.fov = THREE.MathUtils.clamp(cam.fov + e.deltaY * 0.04, 35, 95);
      cam.updateProjectionMatrix();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [camera, gl]);
  return null;
}

export default function InteriorTour({ location }: { location: Location }) {
  const rooms = useMemo(() => location.rooms ?? [], [location]);
  const { room: roomId, setRoom, exitInterior, openEnquiry, reducedMotion } = useTour();
  const room = rooms.find((r) => r.id === roomId) ?? rooms[0];
  const [fade, setFade] = useState(true);
  const timer = useRef<number | null>(null);
  const linkEls = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setFade(false), 60);
    return () => window.clearTimeout(t);
  }, []);

  const go = (id: string) => {
    if (id === room.id) return;
    if (reducedMotion) return setRoom(id);
    setFade(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setRoom(id);
      setFade(false);
    }, 380);
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#0f1813]">
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }} dpr={[1, 2]} frameloop="always">
        <Panorama room={room} villa={location.name} />
        <Projector room={room} els={linkEls} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={-0.35} enableDamping dampingFactor={0.08} />
        <FovZoom />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {room.links.map((l, i) => {
          const to = rooms.find((r) => r.id === l.to);
          if (!to) return null;
          return (
            <button
              key={`${room.id}-${l.to}`}
              ref={(el) => { linkEls.current[i] = el; }}
              type="button"
              onClick={() => go(l.to)}
              style={{ opacity: 0 }}
              className="absolute left-0 top-0 flex flex-col items-center gap-1.5 text-white transition-opacity duration-300"
              aria-label={`Go to ${to.name}`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-[#13201a]/50 backdrop-blur-md transition hover:scale-110 hover:bg-[#f3d9a4]/90 hover:text-[#13201a]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
              </span>
              <span className="whitespace-nowrap rounded-full bg-[#13201a]/60 px-3 py-1 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md">{to.name}</span>
            </button>
          );
        })}
      </div>

      <div className={`pointer-events-none absolute inset-0 bg-[#0f1813] transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`} />

      {/* header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="tb-glass pointer-events-auto rounded-2xl px-4 py-3 sm:px-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3d9a4]">{location.name} · Inside</p>
          <h2 className="tb-serif text-2xl text-white sm:text-3xl">{room.name}</h2>
          <p className="mt-1 max-w-xs text-[11px] leading-snug text-white/65">
            {room.pano ? "360° photograph. Drag to look around." : "Illustrative placeholder. Real 360° photography of this space is not yet available. Drag to look around."}
          </p>
        </div>
        <button onClick={exitInterior} className="tb-btn-ghost pointer-events-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Exterior
        </button>
      </div>

      {/* real photos */}
      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <p className="text-right text-[10px] uppercase tracking-[0.2em] text-white/60">Actual photographs</p>
        {location.images.slice(0, 3).map((src) => (
          <div key={src} className="relative h-24 w-36 overflow-hidden rounded-xl border border-white/20">
            <Image src={src} alt={`${location.name} photograph`} fill sizes="144px" className="object-cover" />
          </div>
        ))}
      </div>

      {/* room navigation */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
        <div className="tb-glass mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
          <div className="tb-scroll flex flex-1 gap-2 overflow-x-auto">
            {rooms.map((r) => (
              <button key={r.id} onClick={() => go(r.id)} className={`tb-chip ${r.id === room.id ? "tb-chip-active" : ""}`}>
                {r.name}
              </button>
            ))}
          </div>
          <button onClick={() => openEnquiry(location.id)} className="tb-btn-primary shrink-0">Enquire Now</button>
        </div>
      </div>
    </div>
  );
}
