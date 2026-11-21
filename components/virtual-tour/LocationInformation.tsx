"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { getLocation } from "./data";
import { useTour } from "./store";

export default function LocationInformation() {
  const { mode, selected, enterVilla, backToAerial, openEnquiry, openPhotos } = useTour();
  const loc = getLocation(selected);
  const [img, setImg] = useState(0);
  useEffect(() => setImg(0), [selected]);

  if (mode !== "location" || !loc) return null;

  return (
    <aside
      key={loc.id}
      className="tb-panel-in tb-glass fixed inset-x-3 bottom-[7.25rem] z-30 max-h-[52vh] overflow-y-auto rounded-3xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-24 sm:max-h-[calc(100vh-12rem)] sm:w-[380px]"
      aria-label={`${loc.name} details`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-t-3xl">
        <Image src={loc.images[img]} alt={`${loc.name} photograph`} fill sizes="(max-width: 640px) 100vw, 380px" className="object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-white backdrop-blur">Actual photograph</span>
        {loc.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {loc.images.map((_, i) => (
              <button key={i} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === img ? "w-5 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        )}
        <button onClick={backToAerial} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[#f3d9a4]">{loc.kind === "villa" ? "Signature villa" : "Resort experience"}</p>
        <h2 className="tb-serif mt-1 text-3xl text-white">{loc.name}</h2>
        <p className="mt-1 text-sm italic text-white/70">{loc.tagline}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/85">{loc.description}</p>
        <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
          {loc.highlights.map((h) => (
            <li key={h} className="flex gap-2.5 text-[13px] text-white/85">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#f3d9a4]" />
              {h}
            </li>
          ))}
        </ul>
        {(loc.outsidePhotos.length > 0 || loc.insidePhotos?.length) && (
          <button
            onClick={() => openPhotos(loc.id, loc.outsidePhotos.length ? "outside" : "inside")}
            className="tb-btn-ghost mt-6 w-full justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 15l5-5 5 5 3-3 5 5" /></svg>
            View real photos in 3D
          </button>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {loc.kind === "villa" ? (
            <button onClick={() => enterVilla(loc.id)} className="tb-btn-primary flex-1">Explore Villa</button>
          ) : (
            <a href={loc.moreUrl} target="_blank" rel="noopener noreferrer" className="tb-btn-primary flex-1">Explore More</a>
          )}
          <button onClick={() => openEnquiry(loc.id)} className="tb-btn-ghost flex-1 justify-center">Enquire Now</button>
        </div>
        {loc.kind === "villa" && (
          <a href={loc.moreUrl} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center text-[11px] uppercase tracking-[0.18em] text-white/60 underline-offset-4 hover:text-white hover:underline">
            View details on touchwoodbliss.com
          </a>
        )}
      </div>
    </aside>
  );
}
