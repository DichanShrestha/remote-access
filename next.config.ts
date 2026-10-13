const nextConfig = {
  /* config options here */
  serverExternalPackages: ['pdfjs-dist'],
  experimental: {
    reactCompiler: true,
    serverActions: { bodySizeLimit: '12mb' },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
