'use client'

import { useState, useEffect, useCallback } from 'react'
import { LendingPool, PoolFilter } from '@/types'
import { fetchLendingPools } from '@/services'

interface UsePoolsReturn {
  pools: LendingPool[]
  filteredPools: LendingPool[]
  isLoading: boolean
  error: string | null
  filter: PoolFilter
  setFilter: (filter: PoolFilter) => void
  lastUpdated: Date | null
  refetch: () => Promise<void>
}

export function usePools(): UsePoolsReturn {
  const [pools, setPools] = useState<LendingPool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<PoolFilter>('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchPools = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchLendingPools()
      setPools(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pools')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  const filteredPools = pools.filter((pool) => {
    switch (filter) {
      case 'stablecoin':
        return pool.symbol.toLowerCase().includes('usd') ||
          pool.symbol.toLowerCase().includes('dai') ||
          pool.symbol.toLowerCase().includes('frax')
      case 'ethereum':
        return pool.chain.toLowerCase() === 'ethereum'
      case 'base':
        return pool.chain.toLowerCase() === 'base'
      case 'arbitrum':
        return pool.chain.toLowerCase() === 'arbitrum'
      default:
        return true
    }
  })

  return {
    pools,
    filteredPools,
    isLoading,
    error,
    filter,
    setFilter,
    lastUpdated,
    refetch: fetchPools,
  }
}
