import type { NextConfig } from "next";

function strapiImageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL?.trim();
  if (!apiUrl) {
    return [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ];
  }

  try {
    const parsed = new URL(apiUrl);
    const protocol =
      parsed.protocol === "https:" ? "https" : parsed.protocol === "http:" ? "http" : "https";
    const port = parsed.port;
    return [
      {
        protocol,
        hostname: parsed.hostname,
        ...(port ? { port } : {}),
        pathname: "/uploads/**",
      },
    ];
  } catch {
    return [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
    ];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: strapiImageRemotePatterns(),
  },
};

export default nextConfig;
