"use client";

import { getLocation } from "./data";
import { useTour } from "./store";

/** Exterior exploration HUD for a single villa: viewpoints + Explore Inside. */
export default function VillaExplorer() {
  const { mode, selected, viewpoint, setViewpoint, enterInterior, openEnquiry, select } = useTour();
  const loc = getLocation(selected);
  if ((mode !== "villa" && mode !== "entering") || !loc?.viewpoints) return null;

  return (
    <>
      <div className="tb-panel-in tb-glass fixed left-3 right-3 top-28 z-30 rounded-2xl p-4 sm:left-6 sm:right-auto sm:top-36 sm:w-80 sm:p-5">
        <button onClick={() => select(loc.id)} className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-white/60 hover:text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          Villa details
        </button>
        <h2 className="tb-serif text-2xl text-white sm:text-3xl">{loc.name}</h2>
        <p className="text-xs italic text-white/70">{loc.tagline}</p>
        <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-[#f3d9a4]">Exterior views</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {loc.viewpoints.map((vp, i) => (
            <button key={vp.label} onClick={() => setViewpoint(i)} className={`tb-chip ${viewpoint === i ? "tb-chip-active" : ""}`}>
              {vp.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={enterInterior} disabled={mode === "entering"} className="tb-btn-primary flex-1">
            {mode === "entering" ? "Entering…" : "Explore Inside"}
          </button>
          <button onClick={() => openEnquiry(loc.id)} className="tb-btn-ghost">Enquire</button>
        </div>
        <p className="mt-3 text-[10px] leading-snug text-white/50">3D villa massing is an approximate placeholder. See photographs for the actual architecture.</p>
      </div>
      {mode === "entering" && <div className="tb-enter-fade pointer-events-none fixed inset-0 z-[35] bg-[#0f1813]" />}
    </>
  );
}
