'use client'

import { useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useBalance } from 'wagmi'
import { formatUnits } from 'viem'
import { Button } from '@/components/ui'

const STATS = [
  { value: '60', label: 'Chains' },
  { value: '23', label: 'Bridges' },
  { value: '32', label: 'DEXs' },
]

type OverviewTab = 'overview' | 'tokens' | 'defi'

function WelcomeView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        <span className="text-white">Welcome to </span>
        <span className="text-green-400">Ruby </span>
        <span className="text-emerald-300">Portfolio!</span>
      </h1>
      <p className="text-gray-400 text-lg mb-10">
        DeFi&apos;s interactive portfolio.
      </p>

      <div className="flex gap-4 mb-10">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="px-8 py-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 text-center min-w-[120px]"
          >
            <p className="text-3xl font-bold text-green-400">{stat.value}</p>
            <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <Button onClick={onGetStarted} className="px-8 py-3 rounded-full">
        Get started
      </Button>
    </div>
  )
}

function PortfolioOverview({ address }: { address: string }) {
  const [activeTab, setActiveTab] = useState<OverviewTab>('overview')
  const { data: balance } = useBalance({ address: address as `0x${string}` })

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : '0.00'

  const usdValue = balance
    ? (parseFloat(formatUnits(balance.value, balance.decimals)) * 2500).toFixed(2)
    : '0.00'

  const tabs: { value: OverviewTab; label: string }[] = [
    { value: 'overview', label: 'Overview' },
    { value: 'tokens', label: 'Tokens' },
    { value: 'defi', label: 'DeFi Protocols' },
  ]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
          <p className="text-gray-400 text-sm mb-2">Portfolio</p>
          <p className="text-5xl font-bold text-white">${usdValue}</p>
          <p className="text-gray-500 text-sm mt-2">{formattedBalance} ETH</p>
        </div>

        <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500 text-xs mb-1">Tokens</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">DeFi Protocols</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Assets</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">E</span>
              </div>
              <div>
                <p className="text-white font-medium">Ethereum</p>
                <p className="text-gray-500 text-sm">ETH</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formattedBalance} ETH</p>
              <p className="text-gray-500 text-sm">${usdValue}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Tokens</h3>
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400 font-bold">E</span>
              </div>
              <div>
                <p className="text-white font-medium">Ethereum</p>
                <p className="text-gray-500 text-sm">Native Token</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formattedBalance}</p>
              <p className="text-gray-500 text-sm">${usdValue}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'defi' && (
        <div className="p-6 rounded-2xl bg-gray-800/30 border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">DeFi Protocols</h3>
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-12 h-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No DeFi positions found</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function PortfolioPage() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const handleGetStarted = () => {
    open()
  }

  return (
    <div className="px-4 py-8">
      {isConnected && address ? (
        <PortfolioOverview address={address} />
      ) : (
        <WelcomeView onGetStarted={handleGetStarted} />
      )}
    </div>
  )
}
