"use client";

import Image from "next/image";
import { LOCATIONS } from "./data";
import { useTour } from "./store";

export default function ResortNavigation() {
  const { mode, selected, select, backToAerial, openEnquiry, openPhotos } = useTour();
  const hidden = mode === "loading" || mode === "interior";
  if (hidden) return null;
  const explore = mode !== "intro";

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4 sm:p-6">
        <a href="https://touchwoodbliss.com/" className="pointer-events-auto" aria-label="Touchwood Bliss home">
          <Image src="/tb/logo-white.png" alt="Touchwood Bliss" width={140} height={70} className="h-auto w-24 drop-shadow sm:w-28" />
        </a>
        <div className="pointer-events-auto flex items-center gap-2">
          {explore && mode !== "aerial" && (
            <button onClick={backToAerial} className="tb-btn-ghost">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 010 18" /></svg>
              <span className="hidden sm:inline">Aerial view</span>
            </button>
          )}
          {explore && (
            <button onClick={() => openPhotos("resort", "outside")} className="tb-btn-ghost" aria-label="Real photos">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 15l5-5 5 5 3-3 5 5" /></svg>
              <span className="hidden sm:inline">Real photos</span>
            </button>
          )}
          <button onClick={() => openEnquiry(selected)} className="tb-btn-primary">Enquire Now</button>
        </div>
      </header>

      {explore && (
        <nav aria-label="Resort locations" className="tb-fade-in fixed inset-x-0 bottom-0 z-20 p-3 sm:p-5">
          <div className="tb-glass tb-scroll mx-auto flex max-w-5xl gap-2 overflow-x-auto rounded-2xl p-2">
            {LOCATIONS.map((l) => (
              <button key={l.id} onClick={() => select(l.id)} className={`tb-chip ${selected === l.id ? "tb-chip-active" : ""}`}>
                {l.kind === "villa" && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
                {l.name.replace(" & Nature Lounge", "")}
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[10px] tracking-wide text-white/70 drop-shadow">
            Illustrative 3D masterplan: approximate placement and placeholder architecture, not to scale.<span className="hidden sm:inline"> Drag to rotate · scroll or pinch to zoom · right-drag to pan.</span>
          </p>
        </nav>
      )}
    </>
  );
}
