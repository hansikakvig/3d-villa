// Optimizes every .glb/.gltf in assets/models-src into public/models:
//   <name>.glb      full quality  (Meshopt or Draco, WebP textures ≤ 2048px)
//   <name>-low.glb  low LOD       (simplified, textures ≤ 512px) for progressive loading
// Usage: npm run models:optimize [-- --compress draco] [-- --ktx2]
import { execFileSync } from "node:child_process";
import { readdirSync, mkdirSync, statSync, existsSync } from "node:fs";
import { join, parse } from "node:path";

const args = process.argv.slice(2);
const compress = args.includes("--compress") ? args[args.indexOf("--compress") + 1] : "meshopt";
const ktx2 = args.includes("--ktx2"); // needs KTX-Software (toktx) on PATH
const SRC = "assets/models-src";
const OUT = "public/models";
mkdirSync(OUT, { recursive: true });

const bin = join("node_modules", ".bin", process.platform === "win32" ? "gltf-transform.cmd" : "gltf-transform");
const run = (a) => execFileSync(bin, a, { stdio: "inherit", shell: process.platform === "win32" });
const kb = (f) => `${(statSync(f).size / 1024).toFixed(0)} KB`;

const files = existsSync(SRC) ? readdirSync(SRC).filter((f) => /\.(glb|gltf)$/i.test(f)) : [];
if (!files.length) console.log(`No models in ${SRC}. Export GLB from Blender there and re-run.`);

for (const f of files) {
  const { name } = parse(f);
  const input = join(SRC, f);
  const full = join(OUT, `${name}.glb`);
  const low = join(OUT, `${name}-low.glb`);
  const tex = ktx2 ? "ktx2" : "webp";
  run(["optimize", input, full, "--compress", compress, "--texture-compress", tex, "--texture-size", "2048"]);
  run(["optimize", input, low, "--compress", compress, "--texture-compress", tex, "--texture-size", "512", "--simplify-ratio", "0.25", "--simplify-error", "0.01"]);
  console.log(`✔ ${f}: ${kb(input)} → ${kb(full)} (full), ${kb(low)} (low)`);
}
