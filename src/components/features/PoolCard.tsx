'use client'

import { LendingPool } from '@/types'

interface PoolCardProps {
  pool: LendingPool
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: 'bg-blue-500',
  Base: 'bg-blue-400',
  Arbitrum: 'bg-blue-600',
  Optimism: 'bg-red-500',
  Polygon: 'bg-purple-500',
}

const PROJECT_COLORS: Record<string, string> = {
  'Aave V3': 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  'Compound V3': 'from-green-500/20 to-green-600/10 border-green-500/30',
  'Spark': 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  'Morpho Blue': 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  'Fluid': 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
  'Euler': 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
  'Venus': 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
}

function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`
  }
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`
  }
  return `$${(tvl / 1_000).toFixed(2)}K`
}

function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`
}

export function PoolCard({ pool }: PoolCardProps) {
  const projectGradient = PROJECT_COLORS[pool.project] || 'from-gray-500/20 to-gray-600/10 border-gray-500/30'
  const chainColor = CHAIN_COLORS[pool.chain] || 'bg-gray-500'

  const handleClick = () => {
    window.open(pool.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left p-5 rounded-2xl bg-gradient-to-br ${projectGradient} border backdrop-blur-sm hover:scale-[1.02] transition-all duration-200 cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white">
            {pool.symbol.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white">{pool.project}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${chainColor} text-white`}>
                {pool.chain}
              </span>
            </div>
            <p className="text-sm text-gray-400">{pool.symbol}</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
          <svg
            className="w-4 h-4 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">APY</p>
          <p className="text-xl font-bold text-green-400">{formatAPY(pool.apy)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">TVL</p>
          <p className="text-xl font-bold text-white">{formatTVL(pool.tvlUsd)}</p>
        </div>
      </div>

      {pool.apyReward && pool.apyReward > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Base: {formatAPY(pool.apyBase)}</span>
            <span className="text-xs text-purple-400">+ Rewards: {formatAPY(pool.apyReward)}</span>
          </div>
        </div>
      )}
    </button>
  )
}
