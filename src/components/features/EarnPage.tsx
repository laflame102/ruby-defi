'use client'

import { useState, useEffect } from 'react'
import { usePools } from '@/hooks'
import { PoolFilter } from '@/types'
import { PoolCard } from './PoolCard'

const FILTER_OPTIONS: { value: PoolFilter; label: string }[] = [
  { value: 'all', label: 'All Markets' },
  { value: 'stablecoin', label: 'Stablecoins' },
  { value: 'ethereum', label: 'Ethereum' },
  { value: 'base', label: 'Base' },
  { value: 'arbitrum', label: 'Arbitrum' },
]

function formatLastUpdated(lastUpdated: Date | null, now: number): string {
  if (!lastUpdated) return ''
  const diff = Math.floor((now - lastUpdated.getTime()) / 1000 / 60)
  if (diff < 1) return 'Updated just now'
  if (diff === 1) return 'Updated 1 minute ago'
  return `Updated ${diff} minutes ago`
}

export function EarnPage() {
  const { filteredPools, isLoading, error, filter, setFilter, lastUpdated } = usePools()
  const [updatedText, setUpdatedText] = useState('')

  useEffect(() => {
    const update = () => {
      if (lastUpdated) {
        setUpdatedText(formatLastUpdated(lastUpdated, Date.now()))
      }
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [lastUpdated])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Earn</h1>
            <p className="text-gray-400 text-sm mt-1">
              Explore lending pools from top DeFi protocols
            </p>
          </div>
          {updatedText && (
            <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
              {updatedText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400">Loading pools...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && filteredPools.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <p className="text-gray-400">No pools found for this filter</p>
          </div>
        )}

        {!isLoading && !error && filteredPools.length > 0 && (
          <>
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm">
                  Explore {filteredPools.length} lending pools across top protocols. Click on any pool to visit the protocol directly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
