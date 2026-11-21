import { existsSync, writeFileSync } from "node:fs";
const URL = "https://github.com/isl-org/MiDaS/releases/download/v2_1/model-small.onnx";
if (existsSync("model-small.onnx")) { console.log("model already downloaded"); process.exit(0); }
console.log("Downloading MiDaS v2.1 small (≈ 66 MB)…");
const res = await fetch(URL);
if (!res.ok) throw new Error(`download failed: ${res.status}`);
writeFileSync("model-small.onnx", Buffer.from(await res.arrayBuffer()));
console.log("✔ model-small.onnx");
