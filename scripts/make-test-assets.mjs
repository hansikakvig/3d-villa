// Generates tiny test assets to verify the toolkit end to end:
//   assets/models-src/_test-villa-block.glb  (built with glTF-Transform)
//   public/pano/_test-grid.jpg               (2:1 equirect grid built with sharp)
import { Document, NodeIO } from "@gltf-transform/core";
import sharp from "sharp";
import { mkdirSync } from "node:fs";

// --- GLB: a subdivided box so simplification has something to do
const doc = new Document();
const buf = doc.createBuffer();
const N = 24, pos = [], idx = [];
const faces = [[0, 1, 2], [0, 2, 1]];
for (const [axis, sign] of [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]) {
  const base = pos.length / 3;
  const u = (axis + 1) % 3, v = (axis + 2) % 3;
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
    const p = [0, 0, 0];
    p[axis] = sign; p[u] = (i / N) * 2 - 1; p[v] = (j / N) * 2 - 1;
    pos.push(...p);
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a = base + i * (N + 1) + j, b = a + N + 1;
    if (sign > 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
}
void faces;
const position = doc.createAccessor().setType("VEC3").setArray(new Float32Array(pos)).setBuffer(buf);
const indices = doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(idx)).setBuffer(buf);
const mat = doc.createMaterial("timber").setBaseColorFactor([0.54, 0.35, 0.21, 1]).setRoughnessFactor(0.8);
const prim = doc.createPrimitive().setAttribute("POSITION", position).setIndices(indices).setMaterial(mat);
const mesh = doc.createMesh("block").addPrimitive(prim);
doc.createScene().addChild(doc.createNode("block").setMesh(mesh));
mkdirSync("assets/models-src", { recursive: true });
await new NodeIO().write("assets/models-src/_test-villa-block.glb", doc);
console.log("✔ assets/models-src/_test-villa-block.glb");

// --- Panorama: labelled 2:1 grid
const W = 4096, H = 2048;
let lines = "";
for (let x = 0; x <= W; x += W / 24) lines += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#ffffff33" stroke-width="3"/>`;
for (let y = 0; y <= H; y += H / 12) lines += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#ffffff33" stroke-width="3"/>`;
const labels = ["N", "E", "S", "W"].map((t, i) => `<text x="${(i * W) / 4 + W / 8}" y="${H / 2 + 40}" font-size="120" fill="#f3d9a4" text-anchor="middle" font-family="sans-serif">${t}</text>`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fa6c6"/><stop offset=".5" stop-color="#dfe6e2"/><stop offset=".5" stop-color="#5f7f4a"/><stop offset="1" stop-color="#2b3a22"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>${lines}${labels}<text x="${W / 2}" y="${H / 2 - 120}" font-size="64" fill="#fff" text-anchor="middle" font-family="sans-serif">Touchwood Bliss · toolkit test panorama</text></svg>`;
mkdirSync("public/pano", { recursive: true });
await sharp(Buffer.from(svg)).jpeg({ quality: 82, progressive: true }).toFile("public/pano/_test-grid.jpg");
console.log("✔ public/pano/_test-grid.jpg");
