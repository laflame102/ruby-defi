'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { DexPair, TrendingToken, ChainFilter, ScreenerSortField, SortDirection } from '@/types'
import { searchDexPairs, fetchTrendingTokens, fetchTokenPairs } from '@/services'

const DEFAULT_QUERY = 'ETH USDC'
const DEBOUNCE_MS = 450

interface UseScreenerReturn {
  pairs: DexPair[]
  allPairs: DexPair[]
  trending: TrendingToken[]
  isLoading: boolean
  isLoadingTrending: boolean
  error: string | null
  query: string
  chainFilter: ChainFilter
  sortField: ScreenerSortField
  sortDirection: SortDirection
  selectedPair: DexPair | null
  setQuery: (q: string) => void
  setChainFilter: (c: ChainFilter) => void
  setSort: (field: ScreenerSortField) => void
  selectPair: (pair: DexPair | null) => void
  loadTrendingToken: (token: TrendingToken) => void
}

export function useScreener(): UseScreenerReturn {
  const [allPairs, setAllPairs] = useState<DexPair[]>([])
  const [trending, setTrending] = useState<TrendingToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTrending, setIsLoadingTrending] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQueryState] = useState('')
  const [chainFilter, setChainFilter] = useState<ChainFilter>('all')
  const [sortField, setSortField] = useState<ScreenerSortField>('liquidity')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedPair, setSelectedPair] = useState<DexPair | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const fetchPairs = useCallback(async (searchQuery: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const results = await searchDexPairs(searchQuery || DEFAULT_QUERY)
      setAllPairs(results.filter(p => p.priceUsd && parseFloat(p.priceUsd) > 0))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pairs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPairs(DEFAULT_QUERY)
    fetchTrendingTokens()
      .then(data => setTrending(data.slice(0, 20)))
      .catch(() => {})
      .finally(() => setIsLoadingTrending(false))
  }, [fetchPairs])

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q)
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        fetchPairs(q)
      }, DEBOUNCE_MS)
    },
    [fetchPairs]
  )

  const setSort = useCallback(
    (field: ScreenerSortField) => {
      setSortField(prev => {
        if (prev === field) {
          setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'))
          return prev
        }
        setSortDirection('desc')
        return field
      })
    },
    []
  )

  const loadTrendingToken = useCallback(async (token: TrendingToken) => {
    setIsLoading(true)
    setError(null)
    setQueryState(token.tokenAddress)
    try {
      const results = await fetchTokenPairs(token.chainId, token.tokenAddress)
      setAllPairs(results.filter(p => p.priceUsd && parseFloat(p.priceUsd) > 0))
    } catch {
      setError('Failed to load token pairs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const pairs = allPairs
    .filter(p => chainFilter === 'all' || p.chainId.toLowerCase() === chainFilter)
    .sort((a, b) => {
      let aVal = 0
      let bVal = 0
      switch (sortField) {
        case 'liquidity':
          aVal = a.liquidity?.usd ?? 0
          bVal = b.liquidity?.usd ?? 0
          break
        case 'volume':
          aVal = a.volume?.h24 ?? 0
          bVal = b.volume?.h24 ?? 0
          break
        case 'priceChange':
          aVal = a.priceChange?.h24 ?? 0
          bVal = b.priceChange?.h24 ?? 0
          break
        case 'txns':
          aVal = (a.txns?.h24?.buys ?? 0) + (a.txns?.h24?.sells ?? 0)
          bVal = (b.txns?.h24?.buys ?? 0) + (b.txns?.h24?.sells ?? 0)
          break
        case 'fdv':
          aVal = a.fdv ?? 0
          bVal = b.fdv ?? 0
          break
        case 'marketCap':
          aVal = a.marketCap ?? 0
          bVal = b.marketCap ?? 0
          break
      }
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal
    })

  return {
    pairs,
    allPairs,
    trending,
    isLoading,
    isLoadingTrending,
    error,
    query,
    chainFilter,
    sortField,
    sortDirection,
    selectedPair,
    setQuery,
    setChainFilter,
    setSort,
    selectPair: setSelectedPair,
    loadTrendingToken,
  }
}
