import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define Story Network Odyssey Testnet
const storyOdyssey = {
  id: 1516,
  name: 'Story Network Odyssey Testnet',
  network: 'story-odyssey',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: ['https://odyssey.storyrpc.io'] },
    public: { http: ['https://odyssey.storyrpc.io'] },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://odyssey.storyscan.xyz' },
  },
  testnet: true,
}

// Get projectId from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'bf3fa112664b2da55869938e7e8486f1'

// Create metadata
const metadata = {
  name: 'Story Music NFT Platform',
  description: 'Upload, discover, and monetize your music with blockchain technology',
  url: 'https://story-music.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [storyOdyssey] as const
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
    '--w3m-border-radius-master': '8px',
  },
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3', // Crypto.com
  ],
})

// Create query client
const queryClient = new QueryClient()

export { config, queryClient, WagmiProvider, QueryClientProvider }
