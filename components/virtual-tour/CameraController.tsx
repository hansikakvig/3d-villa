"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import type { OrbitControls as OrbitImpl } from "three-stdlib";
import { add, getLocation, Vec3 } from "./data";
import { useTour } from "./store";

const INTRO = { pos: [150, 120, 210] as Vec3, target: [0, 0, 0] as Vec3 };
const AERIAL = { pos: [70, 70, 95] as Vec3, target: [-2, 0, -4] as Vec3 };

export default function CameraController() {
  const controls = useRef<OrbitImpl>(null);
  const camera = useThree((s) => s.camera);
  const { mode, selected, viewpoint, reducedMotion, setMode } = useTour();
  const tl = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    camera.position.set(...INTRO.pos);
  }, [camera]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    let shot = AERIAL;
    let dur = 2.4;
    let onComplete: (() => void) | undefined;
    const loc = getLocation(selected);

    if (mode === "loading" || mode === "intro") shot = INTRO;
    else if (mode === "location" && loc) shot = loc.camera;
    else if ((mode === "villa" || mode === "interior") && loc?.viewpoints) {
      const vp = loc.viewpoints[viewpoint] ?? loc.viewpoints[0];
      shot = { pos: add(loc.position, vp.pos), target: add(loc.position, vp.target) };
      dur = 2;
    } else if (mode === "entering" && loc) {
      if (loc.entry) {
        shot = { pos: add(loc.position, loc.entry.pos), target: add(loc.position, loc.entry.target) };
      } else {
        const [px, py, pz] = loc.camera.pos, [tx, ty, tz] = loc.camera.target;
        shot = { pos: [tx + (px - tx) * 0.18, ty + (py - ty) * 0.18 + 1, tz + (pz - tz) * 0.18], target: loc.camera.target };
      }
      dur = 1.6;
      onComplete = () => setMode("interior");
    }
    if (mode === "interior") return;
    if (reducedMotion) dur = 0.01;

    tl.current?.kill();
    c.enabled = false;
    tl.current = gsap
      .timeline({
        onUpdate: () => c.update(),
        onComplete: () => {
          c.enabled = true;
          onComplete?.();
        },
      })
      .to(camera.position, { x: shot.pos[0], y: shot.pos[1], z: shot.pos[2], duration: dur, ease: "power3.inOut" }, 0)
      .to(c.target, { x: shot.target[0], y: shot.target[1], z: shot.target[2], duration: dur, ease: "power3.inOut" }, 0);
  }, [mode, selected, viewpoint, camera, reducedMotion, setMode]);

  // zooming in close on a selected place steps inside its real photographs
  const enterInterior = useTour((s) => s.enterInterior);
  useFrame(() => {
    const c = controls.current;
    if (!c || !c.enabled || mode !== "location" || !selected) return;
    if (camera.position.distanceTo(c.target) < 11) enterInterior();
  });

  const close = mode === "villa" || mode === "entering" || mode === "location";
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={close ? 6 : 10}
      maxDistance={420}
      maxPolarAngle={close ? Math.PI / 2 - 0.015 : Math.PI / 2.15}
      autoRotate={(mode === "intro" || mode === "loading") && !reducedMotion}
      autoRotateSpeed={0.35}
      zoomSpeed={0.8}
      panSpeed={0.7}
      screenSpacePanning={false}
    />
  );
}
