import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The home page of this project is the default starter page,
  // so send visitors straight to the 3D tour.
  async redirects() {
    return [{ source: "/", destination: "/virtual-tour", permanent: false }];
  },
};

export default nextConfig;
