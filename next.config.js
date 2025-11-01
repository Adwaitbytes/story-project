/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.io', 'gateway.ipfs.io', 'cloudflare-ipfs.com', 'ipfs.infura.io'],
  },
  
  env: {
    WALLET_PRIVATE_KEY: process.env.WALLET_PRIVATE_KEY,
    PINATA_JWT: process.env.PINATA_JWT,
    STORY_NETWORK: process.env.STORY_NETWORK,
    RPC_PROVIDER_URL: process.env.RPC_PROVIDER_URL,
    SPG_NFT_CONTRACT_ADDRESS: process.env.SPG_NFT_CONTRACT_ADDRESS,
    STABILITY_API_KEY: process.env.STABILITY_API_KEY,
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
  // Webpack configuration
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };
    
    // Suppress warnings for optional dependencies
    config.ignoreWarnings = [
      { module: /node_modules\/@metamask\/sdk/ },
      { module: /node_modules\/pino/ },
      { file: /node_modules\/@metamask\/sdk/ },
      { file: /node_modules\/pino/ },
    ];
    
    // Ignore node_modules from watch
    if (!isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    
    return config;
  },
  // Page extensions - only these will be treated as pages
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Transpile packages that need it
  transpilePackages: ['@rainbow-me/rainbowkit', 'viem', '@story-protocol/core-sdk'],
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: ['pino', 'pino-pretty', '@metamask/sdk'],
  },
}

module.exports = nextConfig
