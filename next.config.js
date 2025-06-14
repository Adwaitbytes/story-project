/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io', 'gateway.ipfs.io', 'cloudflare-ipfs.com', 'ipfs.infura.io'],
  },
  transpilePackages: ['@rainbow-me/rainbowkit', 'viem'],
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  env: {
    NEXT_PUBLIC_STORY_PROTOCOL_ADDRESS: process.env.NEXT_PUBLIC_STORY_PROTOCOL_ADDRESS,
    NEXT_PUBLIC_SPG_NFT_CONTRACT: process.env.NEXT_PUBLIC_SPG_NFT_CONTRACT,
  }
}

module.exports = nextConfig
