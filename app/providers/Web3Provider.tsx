'use client'

import { ReactNode } from 'react'
import { config, queryClient, WagmiProvider, QueryClientProvider } from '../lib/web3modal'

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
