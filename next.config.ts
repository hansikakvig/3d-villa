import type { NextConfig } from "next";

const longCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];

const nextConfig: NextConfig = {
  // The home page of this project is the default starter page,
  // so send visitors straight to the 3D tour.
  async redirects() {
    return [{ source: "/", destination: "/virtual-tour", permanent: false }];
  },
  async headers() {
    return [
      // decoders are versioned with three; models/panoramas should be renamed when replaced
      { source: "/decoders/:path*", headers: longCache },
      { source: "/models/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/pano/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
      { source: "/:path*.wasm", headers: [{ key: "Content-Type", value: "application/wasm" }] },
    ];
  },
  images: { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
