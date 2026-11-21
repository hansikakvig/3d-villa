"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTour } from "./store";

/** Premium loader, then the intro headline with the Explore Resort CTA. */
export default function LoadingScreen({ ready }: { ready: boolean }) {
  const { mode, setMode, start } = useTour();
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (mode !== "loading") return;
    const id = window.setInterval(() => setPct((p) => Math.min(ready ? 100 : 88, p + (ready ? 9 : 3))), 60);
    return () => window.clearInterval(id);
  }, [ready, mode]);

  useEffect(() => {
    if (pct >= 100 && mode === "loading") {
      const t = window.setTimeout(() => setMode("intro"), 350);
      return () => window.clearTimeout(t);
    }
  }, [pct, mode, setMode]);

  if (mode !== "loading" && mode !== "intro") return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#101a14] transition-opacity duration-1000 ${
          mode === "loading" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        <Image src="/tb/logo-white.png" alt="Touchwood Bliss" width={180} height={90} className="h-auto w-36 opacity-90" priority />
        <div className="mt-10 h-px w-56 overflow-hidden bg-white/15">
          <div className="h-full bg-[#f3d9a4] transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-4 text-[10px] uppercase tracking-[0.32em] text-white/50">Preparing the resort · {pct}%</p>
      </div>

      {mode === "intro" && (
        <div className="tb-fade-in pointer-events-none fixed inset-0 z-30 flex flex-col items-center justify-end bg-gradient-to-t from-[#0f1813]/85 via-[#0f1813]/20 to-transparent px-6 pb-[14vh] text-center sm:justify-center sm:pb-0">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-[#f3d9a4] sm:text-xs">Igatpuri · Western Ghats</p>
          <h1 className="tb-serif max-w-4xl text-4xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">Step Into The World Of Touchwood Bliss</h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
            Fly over the resort, choose a villa and look around inside.
          </p>
          <button onClick={start} className="tb-btn-primary pointer-events-auto mt-9 px-8 py-3.5">
            Explore Resort
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </div>
      )}
    </>
  );
}
