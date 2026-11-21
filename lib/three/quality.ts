"use client";

import { useEffect, useState } from "react";

export type QualityTier = "low" | "medium" | "high";

export interface QualitySettings {
  tier: QualityTier;
  dpr: [number, number];
  shadows: boolean;
  shadowMapSize: number;
  antialias: boolean;
  postprocessing: boolean;
  reducedMotion: boolean;
  isMobile: boolean;
}

const PRESETS: Record<QualityTier, Omit<QualitySettings, "reducedMotion" | "isMobile">> = {
  low: { tier: "low", dpr: [1, 1.25], shadows: false, shadowMapSize: 512, antialias: false, postprocessing: false },
  medium: { tier: "medium", dpr: [1, 1.5], shadows: true, shadowMapSize: 1024, antialias: true, postprocessing: false },
  high: { tier: "high", dpr: [1, 2], shadows: true, shadowMapSize: 2048, antialias: true, postprocessing: true },
};

/** Device heuristics: touch/mobile UA, CPU cores, device memory, reduced motion, ?quality= override. */
export function detectQuality(): QualitySettings {
  if (typeof window === "undefined") return { ...PRESETS.medium, reducedMotion: false, isMobile: false };
  const nav = navigator as Navigator & { deviceMemory?: number };
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent) || (nav.maxTouchPoints > 1 && window.innerWidth < 1024);
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let tier: QualityTier = "high";
  if (isMobile) tier = cores >= 8 && mem >= 6 ? "medium" : "low";
  else if (cores <= 4 || mem <= 4) tier = "medium";

  const override = new URLSearchParams(window.location.search).get("quality");
  if (override === "low" || override === "medium" || override === "high") tier = override;

  return { ...PRESETS[tier], reducedMotion, isMobile };
}

export function useQuality() {
  const [q, setQ] = useState<QualitySettings>(() => ({ ...PRESETS.medium, reducedMotion: false, isMobile: false }));
  useEffect(() => setQ(detectQuality()), []);
  return q;
}

export const qualityPreset = (tier: QualityTier) => PRESETS[tier];
