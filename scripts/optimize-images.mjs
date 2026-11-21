// Responsive image + panorama pipeline (sharp).
//   assets/images-src/**     → public/media/<name>-{640,1280,2048}.{webp,avif}
//   assets/panoramas-src/**  → public/pano/<name>.jpg (≤ 6144×3072) and <name>-mobile.jpg (4096×2048)
// Panoramas stay JPEG for maximum Pannellum/WebGL compatibility.
import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, parse } from "node:path";

const list = (d) => (existsSync(d) ? readdirSync(d).filter((f) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(f)) : []);

mkdirSync("public/media", { recursive: true });
for (const f of list("assets/images-src")) {
  const { name } = parse(f);
  for (const w of [640, 1280, 2048]) {
    const img = sharp(join("assets/images-src", f)).rotate().resize({ width: w, withoutEnlargement: true });
    await img.clone().webp({ quality: 80 }).toFile(`public/media/${name}-${w}.webp`);
    await img.clone().avif({ quality: 55 }).toFile(`public/media/${name}-${w}.avif`);
  }
  console.log(`✔ image ${f}`);
}

mkdirSync("public/pano", { recursive: true });
for (const f of list("assets/panoramas-src")) {
  const { name } = parse(f);
  const src = join("assets/panoramas-src", f);
  const { width = 0, height = 0 } = await sharp(src).metadata();
  if (Math.abs(width / height - 2) > 0.02) console.warn(`⚠ ${f} is ${width}×${height}; equirectangular panoramas should be 2:1`);
  await sharp(src).resize({ width: 6144, height: 3072, fit: "fill", withoutEnlargement: true }).jpeg({ quality: 85, progressive: true, mozjpeg: true }).toFile(`public/pano/${name}.jpg`);
  await sharp(src).resize({ width: 4096, height: 2048, fit: "fill", withoutEnlargement: true }).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(`public/pano/${name}-mobile.jpg`);
  console.log(`✔ panorama ${f}`);
}
