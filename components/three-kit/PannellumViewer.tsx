"use client";

import { useEffect, useRef, useState } from "react";
import "pannellum/build/pannellum.css";

export interface PannoHotspot {
  pitch: number;
  yaw: number;
  text: string;
  /** scene id to jump to (makes it a navigation hotspot) */
  sceneId?: string;
}

export interface PannoScene {
  id: string;
  title: string;
  panorama: string;
  /** smaller file for phones (e.g. from `npm run images:optimize`) */
  mobilePanorama?: string;
  yaw?: number;
  pitch?: number;
  hfov?: number;
  hotSpots?: PannoHotspot[];
}

interface Props {
  scenes: PannoScene[];
  firstScene?: string;
  className?: string;
  autoRotate?: number;
  onSceneChange?: (id: string) => void;
}

/**
 * Pannellum 360° viewer. Pannellum is a browser-global (non-ESM) library, so it
 * is loaded on the client only, on first mount (lazy, never in the SSR bundle).
 */
export default function PannellumViewer({ scenes, firstScene, className, autoRotate = 0, onSceneChange }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const viewer = useRef<PannellumViewer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await import("pannellum/build/pannellum.js");
        if (cancelled || !el.current || !window.pannellum) return;
        const small = window.matchMedia("(max-width: 768px)").matches;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const sceneMap = Object.fromEntries(
          scenes.map((s) => [
            s.id,
            {
              title: s.title,
              type: "equirectangular",
              panorama: small && s.mobilePanorama ? s.mobilePanorama : s.panorama,
              yaw: s.yaw ?? 0,
              pitch: s.pitch ?? 0,
              hfov: s.hfov ?? (small ? 100 : 110),
              hotSpots: (s.hotSpots ?? []).map((h) => ({
                pitch: h.pitch,
                yaw: h.yaw,
                text: h.text,
                type: h.sceneId ? "scene" : "info",
                sceneId: h.sceneId,
              })),
            },
          ]),
        );
        viewer.current = window.pannellum.viewer(el.current, {
          default: { firstScene: firstScene ?? scenes[0]?.id, autoLoad: true, sceneFadeDuration: reduce ? 0 : 800, autoRotate: reduce ? 0 : autoRotate, showControls: true, compass: false },
          scenes: sceneMap,
        });
        viewer.current.on("scenechange", (id) => onSceneChange?.(String(id)));
        viewer.current.on("error", (msg) => setError(String(msg)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load the 360° viewer");
      }
    })();
    return () => {
      cancelled = true;
      viewer.current?.destroy();
      viewer.current = null;
    };
    // scenes are treated as static config for the lifetime of the viewer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div ref={el} style={{ position: "absolute", inset: 0 }} />
      {error && <p style={{ position: "absolute", left: 12, bottom: 12, color: "#fff", fontSize: 12 }}>{error}</p>}
    </div>
  );
}
