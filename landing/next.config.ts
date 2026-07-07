import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const landingDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: 'export',
  turbopack: {
    root: landingDir
  }
};

export default nextConfig;
