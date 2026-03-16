

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "centrosteadycam.it",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
