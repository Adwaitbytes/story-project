
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY,
    PINATA_JWT: process.env.PINATA_JWT,
    STORY_NETWORK: process.env.STORY_NETWORK,
    RPC_PROVIDER_URL: process.env.RPC_PROVIDER_URL,
    SPG_NFT_CONTRACT_ADDRESS: process.env.SPG_NFT_CONTRACT_ADDRESS,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
