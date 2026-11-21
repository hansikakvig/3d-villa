"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { RealPhoto } from "./data";
import { useTour } from "./store";
import { requestTiltPermission } from "./DepthPhoto";

const DepthPhoto = dynamic(() => import("./DepthPhoto"), { ssr: false });

interface Props {
  eyebrow: string;
  title: string;
  photos: RealPhoto[];
  backLabel: string;
  onBack: () => void;
  enquireId?: string | null;
}

/** Full-screen tour through real photographs with the 3D depth effect. */
export default function PhotoTour({ eyebrow, title, photos, backLabel, onBack, enquireId }: Props) {
  const { openEnquiry, reducedMotion } = useTour();
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(true);
  const photo = photos[i];

  useEffect(() => {
    const t = window.setTimeout(() => setFade(false), 80);
    return () => window.clearTimeout(t);
  }, []);

  const go = useCallback(
    (n: number) => {
      const next = (n + photos.length) % photos.length;
      if (next === i) return;
      if (reducedMotion) return setI(next);
      setFade(true);
      window.setTimeout(() => {
        setI(next);
        setFade(false);
      }, 350);
    },
    [i, photos.length, reducedMotion],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-40 bg-[#0f1813]" onPointerDown={() => requestTiltPermission()}>
      {/* blurred real photo behind, so letterboxing never shows */}
      <Image src={photo.src} alt="" fill sizes="100vw" className="scale-110 object-cover opacity-40 blur-2xl" aria-hidden />
      <Suspense fallback={null}>
        <DepthPhoto key={photo.src} src={photo.src} depth={photo.depth} reduced={reducedMotion} />
      </Suspense>
      <div className={`pointer-events-none absolute inset-0 bg-[#0f1813] transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,18,14,0.5))]" />

      {/* header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-6">
        <div className="tb-glass pointer-events-auto max-w-[70%] rounded-2xl px-4 py-3 sm:px-5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3d9a4]">{eyebrow}</p>
          <h2 className="tb-serif text-2xl text-white sm:text-3xl">{title}</h2>
          <p className="mt-0.5 text-sm text-white/85">{photo.title}</p>
          <p className="mt-1 text-[11px] leading-snug text-white/55">
            Real photograph with a 3D depth effect. <span className="hidden sm:inline">Move your cursor to look around.</span>
            <span className="sm:hidden">Drag or tilt your phone.</span>
          </p>
        </div>
        <button onClick={onBack} className="tb-btn-ghost pointer-events-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          {backLabel}
        </button>
      </div>

      {/* prev / next */}
      {photos.length > 1 && (
        <>
          <button onClick={() => go(i - 1)} aria-label="Previous photo" className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#13201a]/45 text-white backdrop-blur-md hover:bg-[#f3d9a4] hover:text-[#13201a] sm:left-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => go(i + 1)} aria-label="Next photo" className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-[#13201a]/45 text-white backdrop-blur-md hover:bg-[#f3d9a4] hover:text-[#13201a] sm:right-6">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </>
      )}

      {/* thumbnails + enquiry */}
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6">
        <div className="tb-glass mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center">
          <div className="tb-scroll flex flex-1 gap-2 overflow-x-auto">
            {photos.map((p, n) => (
              <button
                key={p.src}
                onClick={() => go(n)}
                aria-label={p.title}
                title={p.title}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${n === i ? "border-[#f3d9a4]" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <Image src={p.src} alt={p.title} fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-[11px] tracking-wide text-white/60">{i + 1} / {photos.length}</span>
            <button onClick={() => openEnquiry(enquireId ?? null)} className="tb-btn-primary shrink-0">Enquire Now</button>
          </div>
        </div>
        <p className="mt-2 text-center text-[10px] text-white/50">Photographs: touchwoodbliss.com</p>
      </div>
    </div>
  );
}
