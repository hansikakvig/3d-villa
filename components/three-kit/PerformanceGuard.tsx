"use client";

import { AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useState } from "react";

/**
 * Responsive rendering: watches FPS and scales the pixel ratio between
 * `min` and `max`, and lowers DPR / raycasting while the camera moves.
 */
export default function PerformanceGuard({ min = 0.75, max = 2, onDecline }: { min?: number; max?: number; onDecline?: () => void }) {
  const setDpr = useThree((s) => s.setDpr);
  const [factor, setFactor] = useState(1);
  return (
    <>
      <PerformanceMonitor
        factor={factor}
        onChange={({ factor: f }) => {
          setFactor(f);
          const base = typeof window !== "undefined" ? window.devicePixelRatio : 1;
          setDpr(Math.min(max, Math.max(min, Math.round(base * (0.5 + f * 0.5) * 10) / 10)));
        }}
        onDecline={onDecline}
        flipflops={3}
      />
      <AdaptiveDpr pixelated={false} />
      <AdaptiveEvents />
    </>
  );
}
