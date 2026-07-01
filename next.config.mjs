const BLOB_BASE = "https://ziaarm9b5sovaafa.public.blob.vercel-storage.com";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ziaarm9b5sovaafa.public.blob.vercel-storage.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: `${BLOB_BASE}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
