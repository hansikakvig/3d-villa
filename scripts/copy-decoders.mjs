// Copies Draco + Basis (KTX2) decoders from three into /public/decoders so
// they are self-hosted (no Google CDN dependency). Runs on postinstall.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const libs = join(process.cwd(), "node_modules/three/examples/jsm/libs");
const out = join(process.cwd(), "public/decoders");
const jobs = [
  ["draco/gltf", "draco"],
  ["basis", "basis"],
];

if (!existsSync(libs)) {
  console.warn("[decoders] three not installed yet, skipping");
  process.exit(0);
}
for (const [from, to] of jobs) {
  const src = join(libs, from);
  if (!existsSync(src)) {
    console.warn(`[decoders] missing ${src}`);
    continue;
  }
  mkdirSync(join(out, to), { recursive: true });
  cpSync(src, join(out, to), { recursive: true });
  console.log(`[decoders] ${from} -> public/decoders/${to}`);
}
