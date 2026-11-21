// Generates, for every entry in photos.json:
//   public/real/<id>.webp        web photo (max 2400px, quality 80)
//   public/real/<id>-depth.webp  depth map (white = near), used for the 3D parallax effect
// Usage (from tools/depth): npm install && npm run model && npm run depth [-- id1 id2]
import ort from "onnxruntime-node";
import sharp from "sharp";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "../..");
const SRC = join(ROOT, "assets/real-photos");
const OUT = join(ROOT, "public/real");
mkdirSync(OUT, { recursive: true });

const photos = Object.entries(JSON.parse(readFileSync(join(import.meta.dirname, "photos.json"), "utf8"))).filter(([k]) => !k.startsWith("_"));
const only = process.argv.slice(2);
const session = await ort.InferenceSession.create(join(import.meta.dirname, "model-small.onnx"));
const N = 256, MEAN = [0.485, 0.456, 0.406], STD = [0.229, 0.224, 0.225];

async function infer(buf) {
  const { data } = await sharp(buf).resize(N, N, { fit: "fill", kernel: "lanczos3" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const t = new Float32Array(3 * N * N);
  for (let i = 0; i < N * N; i++) for (let c = 0; c < 3; c++) t[c * N * N + i] = (data[i * 3 + c] / 255 - MEAN[c]) / STD[c];
  const out = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", t, [1, 3, N, N]) });
  return out[session.outputNames[0]].data; // inverse depth, larger = nearer
}

function normalize(d) {
  const sorted = Float32Array.from(d).sort();
  const lo = sorted[Math.floor(sorted.length * 0.02)], hi = sorted[Math.floor(sorted.length * 0.98)];
  const u8 = new Uint8Array(d.length);
  for (let i = 0; i < d.length; i++) u8[i] = Math.max(0, Math.min(255, ((d[i] - lo) / (hi - lo)) * 255));
  return u8;
}

for (const [id, file] of photos) {
  if (only.length && !only.includes(id)) continue;
  const src = join(SRC, file);
  if (!existsSync(src)) { console.warn(`✘ ${id}: missing ${file}`); continue; }
  const base = await sharp(src).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).toBuffer();
  const { width, height } = await sharp(base).metadata();
  await sharp(base).webp({ quality: 80 }).toFile(join(OUT, `${id}.webp`));

  // average a normal + mirrored pass for steadier depth
  const a = await infer(base);
  const b = await infer(await sharp(base).flop().toBuffer());
  const avg = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) avg[y * N + x] = (a[y * N + x] + b[y * N + (N - 1 - x)]) / 2;
  const dw = Math.round(width / 2), dh = Math.round(height / 2);
  await sharp(Buffer.from(normalize(avg)), { raw: { width: N, height: N, channels: 1 } })
    .resize(dw, dh, { fit: "fill", kernel: "cubic" })
    .blur(2)
    .webp({ quality: 85 })
    .toFile(join(OUT, `${id}-depth.webp`));
  console.log(`✔ ${id} (${width}×${height})`);
}
