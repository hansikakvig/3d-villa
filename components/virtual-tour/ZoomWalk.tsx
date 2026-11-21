"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Location, RealPhoto } from "./data";
import { useTour } from "./store";

/**
 * Zoom-to-walk-through: a full-screen real photograph. Zooming in (scroll, pinch,
 * + button or ↑ key) moves towards the photo's focus point. Past the limit you
 * step into the next photo. Zooming out past 1× steps back, and from the first
 * photo returns to the 3D resort.
 */

const Z_MAX = 2.4; // zoom at which we step forward
const Z_BACK = 0.9; // zoom at which we step back

type Leaving = { photo: RealPhoto; dir: 1 | -1; key: number } | null;

export default function ZoomWalk({ location, onExit }: { location: Location; onExit: () => void }) {
  const { openEnquiry, reducedMotion } = useTour();
  const steps = location.walk;
  const [idx, setIdx] = useState(0);
  const [leaving, setLeaving] = useState<Leaving>(null);
  const [hint, setHint] = useState(true);
  const img = useRef<HTMLImageElement>(null);
  const zT = useRef(1.35); // target zoom (start slightly zoomed: "arriving")
  const z = useRef(1.35);
  const pan = useRef({ x: 0, y: 0 });
  const busy = useRef(true); // ignore leftover scroll from the map for a moment
  const idxRef = useRef(0);
  idxRef.current = idx;
  const photo = steps[idx];

  useEffect(() => {
    const t = window.setTimeout(() => (busy.current = false), 900);
    return () => window.clearTimeout(t);
  }, []);

  // preload the neighbours
  useEffect(() => {
    [steps[idx + 1], steps[idx - 1]].forEach((p) => {
      if (p) new window.Image().src = p.src;
    });
  }, [idx, steps]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const next = idxRef.current + dir;
      if (next < 0) {
        busy.current = true;
        onExit();
        return;
      }
      if (next >= steps.length) {
        zT.current = Z_MAX;
        return;
      }
      busy.current = true;
      setLeaving({ photo: steps[idxRef.current], dir, key: Date.now() });
      setIdx(next);
      pan.current = { x: 0, y: 0 };
      // forward: arrive slightly zoomed and settle. back: start zoomed in and pull out
      z.current = dir === 1 ? 1.3 : 1.9;
      zT.current = 1;
      setHint(false);
      window.setTimeout(() => {
        busy.current = false;
        setLeaving(null);
      }, reducedMotion ? 50 : 750);
    },
    [steps, onExit, reducedMotion],
  );

  const zoomBy = useCallback(
    (f: number) => {
      if (busy.current) return;
      zT.current = Math.min(Z_MAX + 0.2, Math.max(Z_BACK - 0.05, zT.current * f));
      if (zT.current > Z_MAX && idxRef.current < steps.length - 1) step(1);
      else if (zT.current > Z_MAX) zT.current = Z_MAX;
      else if (zT.current < Z_BACK) step(-1);
      if (f > 1) setHint(false);
    },
    [step, steps.length],
  );

  // render loop: smooth zoom + pan, applied straight to the <img>
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const k = reducedMotion ? 1 : 0.12;
      z.current += (zT.current - z.current) * k;
      const el = img.current;
      if (el) {
        const zz = Math.max(1, z.current);
        const maxX = ((zz - 1) * window.innerWidth) / 2, maxY = ((zz - 1) * window.innerHeight) / 2;
        pan.current.x = Math.max(-maxX, Math.min(maxX, pan.current.x));
        pan.current.y = Math.max(-maxY, Math.min(maxY, pan.current.y));
        el.style.transform = `translate3d(${pan.current.x}px, ${pan.current.y}px, 0) scale(${z.current})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  // wheel, pinch, drag, keys
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomBy(Math.exp(-e.deltaY * 0.0016));
    };
    const pts = new Map<number, { x: number; y: number }>();
    let pinch = 0;
    let last: { x: number; y: number } | null = null;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button,a")) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      last = { x: e.clientX, y: e.clientY };
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        pinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) zoomBy(d / pinch);
        pinch = d;
      } else if (last && z.current > 1.02) {
        pan.current.x += e.clientX - last.x;
        pan.current.y += e.clientY - last.y;
        last = { x: e.clientX, y: e.clientY };
      }
    };
    const onUp = (e: PointerEvent) => {
      pts.delete(e.pointerId);
      if (pts.size < 2) pinch = 0;
      last = null;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "+" || e.key === "=") zoomBy(1.3);
      if (e.key === "ArrowDown" || e.key === "-") zoomBy(1 / 1.3);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomBy, step]);

  if (!photo) return null;
  const origin = (p: RealPhoto) => `${p.focus[0]}% ${p.focus[1]}%`;

  return (
    <div className="tb-walk fixed inset-0 z-40 touch-none select-none overflow-hidden bg-[#0f1813]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photo.src}
        ref={img}
        src={photo.src}
        alt={`${location.name}: ${photo.title}`}
        draggable={false}
        className={`absolute inset-0 h-full w-full object-cover will-change-transform ${reducedMotion ? "" : "tb-walk-in"}`}
        style={{ transformOrigin: origin(photo) }}
      />
      {leaving && !reducedMotion && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={leaving.key}
          src={leaving.photo.src}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${leaving.dir === 1 ? "tb-walk-out-fwd" : "tb-walk-out-back"}`}
          style={{ transformOrigin: origin(leaving.photo) }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(10,18,14,0.45))]" />

      {/* title */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="tb-glass rounded-2xl px-4 py-3 sm:px-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3d9a4]">
            {location.name} · {photo.zone}
          </p>
          <h2 className="tb-serif text-2xl text-white sm:text-3xl">{photo.title}</h2>
        </div>
        <button onClick={onExit} className="tb-btn-ghost pointer-events-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Resort map
        </button>
      </div>

      {/* zoom hint */}
      {hint && steps.length > 1 && (
        <div className="tb-fade-in pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="tb-glass rounded-full px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white">
            <span className="hidden sm:inline">Scroll to zoom in &amp; step inside</span>
            <span className="sm:hidden">Pinch to zoom in &amp; step inside</span>
          </div>
        </div>
      )}

      {/* bottom: progress + zoom buttons + enquiry */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6">
        <div className="tb-glass mx-auto flex max-w-xl items-center gap-3 rounded-full p-2 pl-4">
          <div className="flex flex-1 items-center gap-1.5" aria-label={`Step ${idx + 1} of ${steps.length}`}>
            {steps.map((s, n) => (
              <span key={s.src} title={s.title} className={`h-1.5 rounded-full transition-all ${n === idx ? "w-6 bg-[#f3d9a4]" : n < idx ? "w-1.5 bg-[#f3d9a4]/60" : "w-1.5 bg-white/30"}`} />
            ))}
          </div>
          <button onClick={() => zoomBy(1 / 1.35)} aria-label="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:border-[#f3d9a4] hover:text-[#f3d9a4]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
          </button>
          <button onClick={() => zoomBy(1.35)} aria-label="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white hover:border-[#f3d9a4] hover:text-[#f3d9a4]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          <button onClick={() => openEnquiry(location.id)} className="tb-btn-primary">Enquire</button>
        </div>
      </div>
    </div>
  );
}
