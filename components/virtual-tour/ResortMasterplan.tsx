"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { LOCATIONS, Vec3 } from "./data";
import { heightAt, fbm, rand, PLATEAU } from "./terrain";
import { useTour } from "./store";

/* ---------- shared materials ---------- */
const M = {
  timber: new THREE.MeshStandardMaterial({ color: "#8a5a36", roughness: 0.8 }),
  darkTimber: new THREE.MeshStandardMaterial({ color: "#5a3a24", roughness: 0.85 }),
  plaster: new THREE.MeshStandardMaterial({ color: "#efe8db", roughness: 0.9 }),
  stone: new THREE.MeshStandardMaterial({ color: "#a59d8f", roughness: 0.95 }),
  deck: new THREE.MeshStandardMaterial({ color: "#b88a5e", roughness: 0.8 }),
  glass: new THREE.MeshStandardMaterial({ color: "#9cc4cc", roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.55 }),
  water: new THREE.MeshStandardMaterial({ color: "#3fa2b0", roughness: 0.08, metalness: 0.15, emissive: "#0b3d45", emissiveIntensity: 0.25 }),
  greenRoof: new THREE.MeshStandardMaterial({ color: "#5d7f3f", roughness: 1 }),
  slate: new THREE.MeshStandardMaterial({ color: "#4a4a46", roughness: 0.8 }),
  terracotta: new THREE.MeshStandardMaterial({ color: "#a4502f", roughness: 0.85 }),
  lawn: new THREE.MeshStandardMaterial({ color: "#7fa356", roughness: 1 }),
  path: new THREE.MeshStandardMaterial({ color: "#cdb994", roughness: 1 }),
  flower: new THREE.MeshStandardMaterial({ color: "#d98a8a", roughness: 1 }),
  flower2: new THREE.MeshStandardMaterial({ color: "#e6c15c", roughness: 1 }),
  fabric: new THREE.MeshStandardMaterial({ color: "#f3eee4", roughness: 1 }),
  play: new THREE.MeshStandardMaterial({ color: "#d9a441", roughness: 0.7 }),
};

type BoxProps = { p: Vec3; s: Vec3; m: THREE.Material; r?: Vec3 };
const Box = ({ p, s, m, r }: BoxProps) => (
  <mesh position={p} rotation={r} material={m} castShadow receiveShadow>
    <boxGeometry args={s} />
  </mesh>
);

/** Hipped roof: 4-sided pyramid scaled to w×d×h (base sits at p). */
const HipRoof = ({ p, w, d, h, m }: { p: Vec3; w: number; d: number; h: number; m: THREE.Material }) => (
  <group position={p} scale={[w, h, d]}>
    <mesh rotation={[0, Math.PI / 4, 0]} position={[0, 0.5, 0]} material={m} castShadow>
      <coneGeometry args={[Math.SQRT1_2, 1, 4, 1]} />
    </mesh>
  </group>
);

/** Gable roof: triangular prism along X. */
const GableRoof = ({ p, w, d, h, m }: { p: Vec3; w: number; d: number; h: number; m: THREE.Material }) => {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-d / 2, 0);
    s.lineTo(d / 2, 0);
    s.lineTo(0, h);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(-w / 2, 0, 0);
    return g;
  }, [w, d, h]);
  return <mesh geometry={geo} position={p} material={m} castShadow />;
};

const Pool = ({ p, w, d }: { p: Vec3; w: number; d: number }) => (
  <group position={p}>
    <Box p={[0, 0.06, 0]} s={[w + 1.6, 0.12, d + 1.6]} m={M.stone} />
    <mesh position={[0, 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.water} receiveShadow>
      <planeGeometry args={[w, d]} />
    </mesh>
  </group>
);

const Lounger = ({ p, r = 0 }: { p: Vec3; r?: number }) => (
  <group position={p} rotation={[0, r, 0]}>
    <Box p={[0, 0.25, 0]} s={[0.7, 0.12, 1.9]} m={M.fabric} />
    <Box p={[0, 0.45, -0.75]} s={[0.7, 0.4, 0.12]} m={M.fabric} r={[-0.6, 0, 0]} />
  </group>
);

const Patch = ({ p, w, d, m, y = 0.03 }: { p: Vec3; w: number; d: number; m: THREE.Material; y?: number }) => (
  <mesh position={[p[0], y, p[2]]} rotation={[-Math.PI / 2, 0, 0]} material={m} receiveShadow>
    <planeGeometry args={[w, d]} />
  </mesh>
);

/* ---------- villas (approximate placeholder massing) ---------- */

function Amora() {
  return (
    <group>
      <Box p={[0, 0.2, 0]} s={[12, 0.4, 8.5]} m={M.stone} />
      <Box p={[-1.5, 1.9, -0.5]} s={[8, 3, 6.5]} m={M.timber} />
      <Box p={[-1.5, 1.9, 2.8]} s={[7.6, 2.8, 0.1]} m={M.glass} />
      <Box p={[4.2, 1.6, 0]} s={[3.2, 2.4, 5]} m={M.plaster} />
      <Box p={[3, 1.5, 2.55]} s={[1.1, 2.2, 0.08]} m={M.darkTimber} />
      {/* living green roof */}
      <Box p={[-1.5, 3.55, -0.5]} s={[8.8, 0.3, 7.3]} m={M.greenRoof} />
      <Box p={[4.2, 2.95, 0]} s={[3.6, 0.25, 5.4]} m={M.greenRoof} />
      {/* timber fins */}
      {Array.from({ length: 9 }).map((_, i) => (
        <Box key={i} p={[-5.3 + i * 0.95, 1.9, 2.95]} s={[0.12, 3, 0.35]} m={M.darkTimber} />
      ))}
      <Box p={[0, 0.45, 4.3]} s={[11, 0.12, 2]} m={M.deck} />
      <Pool p={[0, 0, 7]} w={8} d={3.6} />
      <Lounger p={[5.4, 0, 6.6]} r={-Math.PI / 2} />
      <Lounger p={[5.4, 0, 8]} r={-Math.PI / 2} />
      <Patch p={[-8.5, 0, 2]} w={6} d={10} m={M.lawn} />
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-10.5 + (i % 2) * 4, 0.3, -2 + Math.floor(i / 2) * 2]} material={i % 3 ? M.greenRoof : M.flower} castShadow>
          <sphereGeometry args={[0.55, 10, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Farmsyde() {
  return (
    <group>
      <Box p={[0, 0.15, 0]} s={[16, 0.3, 9]} m={M.stone} />
      <Box p={[-1, 1.9, -0.5]} s={[11, 3.2, 6.5]} m={M.plaster} />
      <GableRoof p={[-1, 3.5, -0.5]} w={11.8} d={7.6} h={2.4} m={M.slate} />
      <Box p={[6.5, 1.6, -1]} s={[4, 2.6, 5.5]} m={M.plaster} />
      <GableRoof p={[6.5, 2.9, -1]} w={4.6} d={6.2} h={1.8} m={M.slate} />
      {/* verandah */}
      <Box p={[-1, 0.4, 3.6]} s={[11, 0.12, 2.2]} m={M.deck} />
      <Box p={[-1, 3.1, 3.6]} s={[11.4, 0.15, 2.5]} m={M.darkTimber} />
      {[-6, -3, 0, 3, 4.2].map((x) => (
        <Box key={x} p={[x, 1.75, 4.6]} s={[0.22, 2.7, 0.22]} m={M.timber} />
      ))}
      {[-4.5, -1, 2.5].map((x) => (
        <Box key={x} p={[x, 1.7, 2.76]} s={[1.6, 2, 0.06]} m={M.glass} />
      ))}
      <Pool p={[-2, 0, 8.5]} w={9} d={4} />
      {[3.8, 5.2].map((x) => <Lounger key={x} p={[x, 0, 8.5]} />)}
      <Patch p={[-12.5, 0, 1]} w={10} d={13} m={M.lawn} />
      {/* outdoor seating on lawn */}
      <mesh position={[-12.5, 0.1, 1]} material={M.stone} receiveShadow>
        <cylinderGeometry args={[1.6, 1.6, 0.15, 20]} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Box key={i} p={[-12.5 + Math.cos(a) * 2.6, 0.3, 1 + Math.sin(a) * 2.6]} s={[0.7, 0.5, 0.7]} m={M.timber} />;
      })}
    </group>
  );
}

function Courtyard() {
  // Nalukettu-style: four wings around an open court, steep terracotta roofs
  const wings: { p: Vec3; w: number; d: number }[] = [
    { p: [0, 0, -5], w: 14, d: 4 },
    { p: [0, 0, 5], w: 14, d: 4 },
    { p: [-5, 0, 0], w: 4, d: 6 },
    { p: [5, 0, 0], w: 4, d: 6 },
  ];
  return (
    <group>
      <Box p={[0, 0.2, 0]} s={[15.5, 0.4, 15.5]} m={M.stone} />
      {wings.map((wg, i) => (
        <group key={i} position={wg.p}>
          <Box p={[0, 1.7, 0]} s={[wg.w, 2.6, wg.d]} m={M.plaster} />
          <HipRoof p={[0, 3, 0]} w={wg.w + 1.6} d={wg.d + 1.6} h={2.6} m={M.terracotta} />
        </group>
      ))}
      {/* courtyard pillars + tulsi platform */}
      {[-2.6, 2.6].flatMap((x) => [-2.6, 2.6].map((z) => <Box key={`${x}${z}`} p={[x, 1.5, z]} s={[0.25, 2.6, 0.25]} m={M.darkTimber} />))}
      <Patch p={[0, 0, 0]} w={5} d={5} m={M.lawn} y={0.42} />
      <Box p={[0, 0.7, 0]} s={[0.9, 0.6, 0.9]} m={M.terracotta} />
      <Box p={[0, 1.5, 7.05]} s={[1.6, 2.2, 0.1]} m={M.darkTimber} />
      {/* infinity pool on the mountain-facing edge */}
      <Box p={[0, 0.4, -9]} s={[14, 0.12, 2.4]} m={M.deck} />
      <Pool p={[0, 0.25, -12]} w={13} d={3.6} />
      <Box p={[0, -0.6, -14.2]} s={[14.6, 2, 0.4]} m={M.stone} />
      {[-4, -2].map((x) => <Lounger key={x} p={[x, 0.3, -9]} r={Math.PI} />)}
    </group>
  );
}

/* ---------- amenities ---------- */

function MainPool() {
  return (
    <group>
      <Box p={[0, 0.05, 0]} s={[22, 0.1, 12]} m={M.deck} />
      <Pool p={[0, 0, 0]} w={16} d={6.5} />
      {Array.from({ length: 6 }).map((_, i) => <Lounger key={i} p={[-7.5 + i * 3, 0, 5.2]} r={Math.PI} />)}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, -4.5]}>
          <Box p={[0, 1.2, 0]} s={[0.1, 2.4, 0.1]} m={M.darkTimber} />
          <mesh position={[0, 2.5, 0]} material={M.fabric} castShadow>
            <coneGeometry args={[1.6, 0.6, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RootsCafe() {
  return (
    <group>
      <Box p={[0, 0.2, 0]} s={[12, 0.4, 9]} m={M.deck} />
      {[-5, -1.7, 1.7, 5].flatMap((x) => [-3.8, 3.8].map((z) => <Box key={`${x}${z}`} p={[x, 1.8, z]} s={[0.3, 3, 0.3]} m={M.timber} />))}
      <Box p={[0, 1.6, -3.9]} s={[10.6, 2.8, 0.3]} m={M.stone} />
      <HipRoof p={[0, 3.2, 0]} w={13.5} d={10.5} h={2.2} m={M.greenRoof} />
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[-3.5 + (i % 3) * 3.5, 0.4, -0.8 + Math.floor(i / 3) * 3]}>
          <mesh position={[0, 0.7, 0]} material={M.darkTimber} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.08, 16]} />
          </mesh>
          <Box p={[0, 0.35, 0]} s={[0.1, 0.7, 0.1]} m={M.darkTimber} />
        </group>
      ))}
    </group>
  );
}

function Lawns() {
  return (
    <group>
      <Patch p={[0, 0, 0]} w={26} d={18} m={M.lawn} />
      {/* celebration canopy */}
      <group position={[0, 0, -5]}>
        {[-4, 4].flatMap((x) => [-2.5, 2.5].map((z) => <Box key={`${x}${z}`} p={[x, 1.6, z]} s={[0.15, 3.2, 0.15]} m={M.fabric} />))}
        <GableRoof p={[0, 3.2, 0]} w={9} d={6} h={1.5} m={M.fabric} />
      </group>
      {Array.from({ length: 12 }).map((_, i) => (
        <group key={i} position={[-12 + (i % 6) * 4.8, 0, i < 6 ? -8.5 : 8.5]}>
          <Box p={[0, 1.4, 0]} s={[0.08, 2.8, 0.08]} m={M.darkTimber} />
          <mesh position={[0, 2.85, 0]}>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#ffe6b0" emissive="#ffcf70" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Gardens() {
  return (
    <group>
      <Patch p={[0, 0, 0]} w={20} d={16} m={M.lawn} />
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-6 + i * 3, 0.15, -4]} material={i % 2 ? M.flower : M.flower2} castShadow>
          <boxGeometry args={[2.2, 0.3, 1.2]} />
        </mesh>
      ))}
      {/* kids play area */}
      <Patch p={[4, 0, 3]} w={7} d={6} m={M.path} y={0.05} />
      <Box p={[2.5, 1.2, 3]} s={[0.15, 2.4, 0.15]} m={M.play} />
      <Box p={[5.5, 1.2, 3]} s={[0.15, 2.4, 0.15]} m={M.play} />
      <Box p={[4, 2.4, 3]} s={[3.3, 0.15, 0.15]} m={M.play} />
      <Box p={[3.4, 0.6, 3]} s={[0.6, 0.06, 0.3]} m={M.timber} />
      <Box p={[4.6, 0.6, 3]} s={[0.6, 0.06, 0.3]} m={M.timber} />
      <Box p={[5, 0.6, 5]} s={[0.4, 1.2, 2.4]} m={M.play} r={[0.45, 0, 0]} />
      {/* bonfire circle */}
      <group position={[-5, 0, 3]}>
        <mesh position={[0, 0.1, 0]} material={M.stone}>
          <torusGeometry args={[1, 0.18, 6, 16]} />
        </mesh>
        <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.4, 0.8, 6]} />
          <meshStandardMaterial color="#e07a2e" emissive="#e0571e" emissiveIntensity={2} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return <Box key={i} p={[Math.cos(a) * 2.4, 0.25, Math.sin(a) * 2.4]} s={[0.9, 0.4, 0.4]} m={M.timber} r={[0, -a, 0]} />;
        })}
      </group>
    </group>
  );
}

const MODELS: Record<string, () => React.ReactElement> = {
  amora: Amora,
  farmsyde: Farmsyde,
  courtyard: Courtyard,
  pool: MainPool,
  roots: RootsCafe,
  lawns: Lawns,
  gardens: Gardens,
};

/* ---------- terrain, paths, trees ---------- */

function Terrain() {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1600, 1600, 300, 300);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    const grass = new THREE.Color("#6f9248"), forest = new THREE.Color("#3f5f32"), rock = new THREE.Color("#7d7566"), dry = new THREE.Color("#9a9a5a");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      const n = fbm(x * 0.08, z * 0.08, 3);
      const r = Math.hypot(x, z);
      if (r < PLATEAU) c.copy(grass).lerp(dry, n * 0.35);
      else c.copy(forest).lerp(grass, n * 0.5);
      if (h > 45) c.lerp(rock, Math.min(0.6, (h - 45) / 30));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} />
    </mesh>
  );
}

const HUB: Vec3 = [-6, 0, 0];

function Paths() {
  const segs = useMemo(() => {
    const out: { p: Vec3; len: number; rot: number }[] = [];
    LOCATIONS.forEach((l) => {
      const [x, , z] = l.position;
      const dx = x - HUB[0], dz = z - HUB[2];
      const len = Math.hypot(dx, dz);
      out.push({ p: [HUB[0] + dx / 2, 0.02, HUB[2] + dz / 2], len, rot: Math.atan2(dx, dz) });
    });
    return out;
  }, []);
  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={s.p} rotation={[-Math.PI / 2, 0, s.rot]} material={M.path} receiveShadow>
          <planeGeometry args={[2.2, s.len]} />
        </mesh>
      ))}
      <mesh position={[HUB[0], 0.025, HUB[2]]} rotation={[-Math.PI / 2, 0, 0]} material={M.path} receiveShadow>
        <circleGeometry args={[4, 32]} />
      </mesh>
    </group>
  );
}

const EXCLUDE: { c: Vec3; r: number }[] = [
  ...LOCATIONS.map((l) => ({ c: l.position, r: l.kind === "villa" ? 14 : 13 })),
  { c: HUB, r: 6 },
];

function Trees() {
  const foliage = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const rnd = rand(42);
    const list: { x: number; y: number; z: number; s: number; palm: boolean }[] = [];
    let guard = 0;
    while (list.length < 1100 && guard++ < 20000) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 175;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      // keep the Courtyard villa's mountain vista open
      if (x > -16 && x < 28 && z < -44 && z > -150) continue;
      if (EXCLUDE.some((e) => Math.hypot(x - e.c[0], z - e.c[2]) < e.r)) continue;
      // avoid path strips roughly
      if (r < PLATEAU && rnd() < 0.55) continue;
      const y = heightAt(x, z);
      if (y > 50) continue;
      list.push({ x, y, z, s: 0.7 + rnd() * 0.9, palm: r < PLATEAU && rnd() < 0.15 });
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    const rnd = rand(7);
    items.forEach((t, i) => {
      d.position.set(t.x, t.y + 1.2 * t.s, t.z);
      d.scale.setScalar(t.s);
      d.rotation.set(0, rnd() * 6, 0);
      d.updateMatrix();
      trunks.current!.setMatrixAt(i, d.matrix);
      d.position.set(t.x, t.y + 3.4 * t.s, t.z);
      d.scale.set(t.s * (1 + rnd() * 0.4), t.s * (1.1 + rnd() * 0.6), t.s * (1 + rnd() * 0.4));
      d.updateMatrix();
      foliage.current!.setMatrixAt(i, d.matrix);
      c.setHSL(0.24 + rnd() * 0.08, 0.35 + rnd() * 0.2, 0.22 + rnd() * 0.12);
      foliage.current!.setColorAt(i, c);
    });
    trunks.current!.instanceMatrix.needsUpdate = true;
    foliage.current!.instanceMatrix.needsUpdate = true;
    if (foliage.current!.instanceColor) foliage.current!.instanceColor.needsUpdate = true;
  }, [items]);

  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, items.length]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.4, 5]} />
        <meshStandardMaterial color="#5a3d28" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={foliage} args={[undefined, undefined, items.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ---------- selection highlight ---------- */

function Highlight({ active, hovered, radius }: { active: boolean; hovered: boolean; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    const target = active ? 0.55 + Math.sin(clock.elapsedTime * 2.2) * 0.2 : hovered ? 0.35 : 0;
    mat.opacity += (target - mat.opacity) * 0.12;
    ref.current.visible = mat.opacity > 0.01;
  });
  return (
    <mesh ref={ref} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius - 0.5, radius, 64]} />
      <meshBasicMaterial color="#f3d9a4" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export default function ResortMasterplan() {
  const selected = useTour((s) => s.selected);
  const hovered = useTour((s) => s.hovered);
  const select = useTour((s) => s.select);
  const hover = useTour((s) => s.hover);

  return (
    <group>
      <Terrain />
      <Paths />
      <Trees />
      {LOCATIONS.map((l) => {
        const Model = MODELS[l.id];
        const onClick = (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          select(l.id);
        };
        return (
          <group
            key={l.id}
            position={l.position}
            onClick={onClick}
            onPointerOver={(e) => {
              e.stopPropagation();
              hover(l.id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              hover(null);
              document.body.style.cursor = "";
            }}
          >
            <Model />
            <Highlight active={selected === l.id} hovered={hovered === l.id} radius={l.kind === "villa" ? 13 : 12} />
          </group>
        );
      })}
    </group>
  );
}
