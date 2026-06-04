/** @type {import('next').NextConfig} */

// Saat build untuk production (GitHub Pages + Cloudflare Worker routing),
// asset prefix harus absolut ke subfolder origin agar tidak bergantung
// pada Worker rewrite untuk setiap request static asset.
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",

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