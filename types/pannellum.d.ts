declare module "pannellum/build/pannellum.js";
declare module "pannellum/build/pannellum.css";

interface PannellumViewer {
  destroy(): void;
  loadScene(sceneId: string, pitch?: number, yaw?: number, hfov?: number): void;
  getScene(): string;
  getYaw(): number;
  getPitch(): number;
  on(event: string, cb: (...args: unknown[]) => void): PannellumViewer;
  resize(): void;
}

interface Window {
  pannellum?: { viewer(container: HTMLElement | string, config: Record<string, unknown>): PannellumViewer };
}
