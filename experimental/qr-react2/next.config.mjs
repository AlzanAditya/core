/** @type {import('next').NextConfig} */
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Saat build untuk production (GitHub Pages + Cloudflare Worker routing),
// asset prefix harus absolut ke subfolder origin agar tidak bergantung
// pada Worker rewrite untuk setiap request static asset.
const isProd = process.env.NODE_ENV === "production";
const appRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  output: "export",
  trailingSlash: false,

  turbopack: {
    root: appRoot,
  },

  // assetPrefix: mengubah semua href `/_next/static/*` di HTML output menjadi
  // `https://zanxa.studio/apps/qrreact/_next/static/*`
  // Sehingga browser langsung fetch ke origin — tidak perlu melalui Worker.
  assetPrefix: isProd ? "https://zanxa.studio/apps/qrreact" : "",

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
