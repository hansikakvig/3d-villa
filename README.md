This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Touchwood Bliss: 3D Virtual Resort Tour (`/virtual-tour`)

```bash
npm install
npm run dev      # http://localhost:3000/virtual-tour
npm run build && npm start
```

Code: `components/virtual-tour/`. `data.ts` is the single source of content, contacts, camera shots and rooms.

| Component | Role |
|---|---|
| `VirtualTourExperience` | Route root: WebGL detection and fallback, reduced motion, Esc key |
| `ResortScene` | R3F canvas, sky, fog, lights and shadows, hotspots (lazy-loaded) |
| `ResortMasterplan` | Terrain, mountains, trees, paths, villa and amenity placeholder models |
| `CameraController` | OrbitControls plus GSAP fly-to transitions |
| `LocationHotspot` | In-scene labels |
| `ResortNavigation` | Header, logo, location chips |
| `LocationInformation` | Glass info panel with real photos |
| `VillaExplorer` | Villa exterior viewpoints, Explore Inside |
| `InteriorTour` | 360° viewer (drag, touch, wheel zoom), room hotspots and navigation |
| `EnquiryPanel` | Booking engine, phone lines, reservations email, contact page |
| `LoadingScreen` | Loader and intro headline |

### Adding real assets
- **360° photos**: drop equirectangular JPG/WebP files (2:1, about 6000×3000) in `public/tb/pano/` and set `pano: "/tb/pano/amora-living.jpg"` on the room in `data.ts`. The "placeholder" label disappears automatically.
- **Real villa models**: export GLB from Blender (Draco + KTX2 via `gltf-transform optimize`), then replace the matching function in `ResortMasterplan.tsx` with `useGLTF`.
- **Masterplan**: update `position` / `camera` values in `data.ts` from the surveyed site plan.
