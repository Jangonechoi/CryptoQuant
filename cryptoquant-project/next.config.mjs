/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s2.coinmarketcap.com",
        pathname: "/static/img/coins/**",
      },
      {
        protocol: "https",
        hostname: "cryptoicons.org",
        pathname: "/api/**",
      },
      {
        protocol: "https",
        hostname: "assets.coinlore.com",
        pathname: "/img/**",
      },
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
        pathname: "/coins/images/**",
      },
      {
        protocol: "https",
        hostname: "resources.cryptocompare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.cryptocompare.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.cryptocompare.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
