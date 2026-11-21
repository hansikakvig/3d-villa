"use client";

import { EffectComposer, Bloom, SMAA, Vignette, N8AO } from "@react-three/postprocessing";
import type { QualityTier } from "@/lib/three/quality";

/**
 * Subtle hospitality-grade post effects. Returns nothing on the low tier.
 * Use with <Canvas gl={{ antialias: false }}> on the high tier (SMAA replaces MSAA).
 */
export default function Effects({ tier = "high", ao = false }: { tier?: QualityTier; ao?: boolean }) {
  if (tier === "low") return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={ao}>
      <>{ao && tier === "high" ? <N8AO aoRadius={2} intensity={1.2} halfRes /> : null}</>
      <Bloom intensity={0.25} luminanceThreshold={0.9} luminanceSmoothing={0.2} mipmapBlur />
      <Vignette offset={0.3} darkness={0.45} />
      <SMAA />
    </EffectComposer>
  );
}
