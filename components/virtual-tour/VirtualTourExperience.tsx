"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";
import ResortNavigation from "./ResortNavigation";
import LocationInformation from "./LocationInformation";
import EnquiryPanel from "./EnquiryPanel";
import { LOCATIONS, getLocation } from "./data";
import { useTour } from "./store";

// 3D bundles are lazy-loaded on the client only
const ResortScene = dynamic(() => import("./ResortScene"), { ssr: false });
const ZoomWalk = dynamic(() => import("./ZoomWalk"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Static fallback when WebGL is unavailable. */
function Fallback() {
  const openEnquiry = useTour((s) => s.openEnquiry);
  return (
    <div className="min-h-screen bg-[#101a14] px-5 py-16 text-white">
      <h1 className="tb-serif text-center text-4xl sm:text-5xl">Step Into The World Of Touchwood Bliss</h1>
      <p className="mt-3 text-center text-sm text-white/60">Your browser does not support the 3D tour. Here are the resort&apos;s spaces.</p>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOCATIONS.map((l) => (
          <div key={l.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="relative aspect-[4/3]"><Image src={l.images[0]} alt={l.name} fill sizes="400px" className="object-cover" /></div>
            <div className="p-5">
              <h2 className="tb-serif text-2xl">{l.name}</h2>
              <p className="mt-2 text-sm text-white/70">{l.description}</p>
              <button onClick={() => openEnquiry(l.id)} className="tb-btn-primary mt-4">Enquire Now</button>
            </div>
          </div>
        ))}
      </div>
      <EnquiryPanel />
    </div>
  );
}

export default function VirtualTourExperience() {
  const [ready, setReady] = useState(false);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const { mode, selected, setReducedMotion, backToAerial, exitInterior } = useTour();

  useEffect(() => {
    setWebgl(hasWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const on = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [setReducedMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const s = useTour.getState();
      if (s.enquiryOpen) s.closeEnquiry();
      else if (s.mode === "interior") s.exitInterior();
      else if (s.mode === "villa" && s.selected) s.select(s.selected);
      else if (s.mode === "location") backToAerial();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [backToAerial]);

  if (webgl === false) return <Fallback />;

  const loc = getLocation(selected);
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#101a14] text-white">
      {webgl && <div className="absolute inset-0"><ResortScene onReady={() => setReady(true)} /></div>}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,18,14,0.45))]" />
      <ResortNavigation />
      <LocationInformation />
      {mode === "entering" && <div className="tb-enter-zoom pointer-events-none fixed inset-0 z-[35] bg-[#0f1813]" />}
      {mode === "interior" && loc && loc.walk.length > 0 && <ZoomWalk key={loc.id} location={loc} onExit={exitInterior} />}
      <EnquiryPanel />
      <LoadingScreen ready={ready} />
    </main>
  );
}
