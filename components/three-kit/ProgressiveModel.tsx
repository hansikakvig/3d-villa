"use client";

import { Suspense, useEffect, useMemo } from "react";
import type { ThreeElements } from "@react-three/fiber";
import { useResortGLTF } from "@/lib/three/useResortGLTF";

type GroupProps = ThreeElements["group"];

function Model({ url, shadows = true, ...props }: { url: string; shadows?: boolean } & GroupProps) {
  const { scene } = useResortGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    clone.traverse((o) => {
      if ("isMesh" in o && o.isMesh) {
        o.castShadow = shadows;
        o.receiveShadow = shadows;
      }
    });
  }, [clone, shadows]);
  return <primitive object={clone} {...props} />;
}

/** Shown before any model data arrives. */
function Placeholder({ size = 1 }: { size?: number }) {
  return (
    <mesh>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color="#c8bca6" transparent opacity={0.35} />
    </mesh>
  );
}

/**
 * Progressive GLB: placeholder → low LOD (`name-low.glb`) → full model (`name.glb`).
 * Both files come from `npm run models:optimize`.
 */
export default function ProgressiveModel({
  url,
  lowUrl,
  placeholderSize,
  shadows,
  ...props
}: { url: string; lowUrl?: string; placeholderSize?: number; shadows?: boolean } & GroupProps) {
  const low = lowUrl ?? url.replace(/\.glb$/i, "-low.glb");
  return (
    <group {...props}>
      <Suspense fallback={<Placeholder size={placeholderSize} />}>
        <Suspense fallback={<Model url={low} shadows={shadows} />}>
          <Model url={url} shadows={shadows} />
        </Suspense>
      </Suspense>
    </group>
  );
}
