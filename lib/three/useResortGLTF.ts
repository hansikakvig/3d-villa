"use client";

import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { WebGLRenderer } from "three";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { BASIS_TRANSCODER_PATH, DRACO_DECODER_PATH } from "./config";

let ktx2: KTX2Loader | null = null;
let ktx2Renderer: WebGLRenderer | null = null;

/** One shared KTX2 loader per renderer (transcoder runs in a worker pool). */
export function getKTX2Loader(gl: WebGLRenderer) {
  if (!ktx2 || ktx2Renderer !== gl) {
    ktx2?.dispose();
    ktx2 = new KTX2Loader().setTranscoderPath(BASIS_TRANSCODER_PATH).detectSupport(gl);
    ktx2Renderer = gl;
  }
  return ktx2;
}

/**
 * Loads a GLB/GLTF with Draco, Meshopt and KTX2 support.
 * Suspends while loading. Wrap in <Suspense>.
 */
export function useResortGLTF(url: string) {
  const gl = useThree((s) => s.gl);
  return useGLTF(url, DRACO_DECODER_PATH, true, (loader) => {
    (loader as unknown as GLTFLoader).setKTX2Loader(getKTX2Loader(gl));
  });
}

/** Start downloading early (Draco + Meshopt; KTX2 files are fetched on first use). */
useResortGLTF.preload = (url: string) => useGLTF.preload(url, DRACO_DECODER_PATH, true);
useResortGLTF.clear = (url: string) => useGLTF.clear(url);
