'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, optimism, polygon, sepolia } from '@reown/appkit/networks'
import { WagmiProvider, type Config } from 'wagmi'
import { wagmiAdapter, projectId } from '@/config/web3'

const queryClient = new QueryClient()

const metadata = {
  name: 'Ruby DeFi',
  description: 'Decentralized Finance Reimagined',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://ruby.defi',
  icons: ['/favicon.ico']
}

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [sepolia, mainnet, arbitrum, optimism, polygon],
  defaultNetwork: sepolia,
  metadata,
  features: {
    analytics: true,
    socials: ['google', 'github', 'apple', 'discord']
  }
})

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
