import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React 19 StrictMode double-mounting makes @react-three/fiber dispose its
  // WebGL root mid-Suspense (forceContextLoss) — the desk canvas dies on any
  // texture load. Off until fiber handles StrictMode remounts cleanly.
  reactStrictMode: false,
};

export default nextConfig;
