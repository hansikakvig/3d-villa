// Playwright smoke test: loads routes, fails on page errors, saves screenshots.
// Usage: npm run build && npm start   (in another terminal)  then  npm run test:smoke
// First time on a new machine: npm run playwright:install
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const routes = (process.env.ROUTES ?? "/virtual-tour,/toolkit-check").split(",");
mkdirSync("test-results", { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failed = 0;
for (const vp of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
  for (const r of routes) {
    const page = await browser.newPage({ viewport: vp });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    const res = await page.goto(BASE + r, { waitUntil: "networkidle" });
    await page.waitForTimeout(4000);
    const file = `test-results/${vp.name}${r.replace(/\//g, "_")}.png`;
    await page.screenshot({ path: file });
    const ok = res?.ok() && errors.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "✔" : "✘"} ${vp.name} ${r} (${res?.status()}) ${errors.join(" | ")} → ${file}`);
    await page.close();
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
