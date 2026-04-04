'use client'

import { useState, useEffect } from 'react'
import type { GlobalTvlPoint, ChainTvl, ProtocolEntry, VolumeProtocol, FeeProtocol, AnalyticsTab } from '@/types'
import {
  fetchGlobalTvlHistory,
  fetchChainTvls,
  fetchTopProtocols,
  fetchDexOverview,
  fetchFeesOverview,
} from '@/services'

interface UseAnalyticsReturn {
  tvlHistory: GlobalTvlPoint[]
  chains: ChainTvl[]
  protocols: ProtocolEntry[]
  dexs: VolumeProtocol[]
  fees: FeeProtocol[]
  totalTvl: number
  totalDexVolume24h: number
  totalFees24h: number
  tvlChange24h: number | null
  isLoading: boolean
  error: string | null
  tab: AnalyticsTab
  setTab: (t: AnalyticsTab) => void
}

export function useAnalytics(): UseAnalyticsReturn {
  const [tvlHistory, setTvlHistory] = useState<GlobalTvlPoint[]>([])
  const [chains, setChains] = useState<ChainTvl[]>([])
  const [protocols, setProtocols] = useState<ProtocolEntry[]>([])
  const [dexs, setDexs] = useState<VolumeProtocol[]>([])
  const [fees, setFees] = useState<FeeProtocol[]>([])
  const [totalDexVolume24h, setTotalDexVolume24h] = useState(0)
  const [totalFees24h, setTotalFees24h] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<AnalyticsTab>('dexs')

  useEffect(() => {
    Promise.allSettled([
      fetchGlobalTvlHistory(),
      fetchChainTvls(),
      fetchTopProtocols(),
      fetchDexOverview(),
      fetchFeesOverview(),
    ]).then(([tvlRes, chainsRes, protsRes, dexRes, feesRes]) => {
      if (tvlRes.status === 'fulfilled') setTvlHistory(tvlRes.value)
      if (chainsRes.status === 'fulfilled') setChains(chainsRes.value)
      if (protsRes.status === 'fulfilled') setProtocols(protsRes.value)
      if (dexRes.status === 'fulfilled') {
        setDexs(dexRes.value.protocols)
        setTotalDexVolume24h(dexRes.value.total24h)
      }
      if (feesRes.status === 'fulfilled') {
        setFees(feesRes.value.protocols)
        setTotalFees24h(feesRes.value.total24h)
      }
      setIsLoading(false)
    }).catch(() => {
      setError('Failed to load analytics data')
      setIsLoading(false)
    })
  }, [])

  const totalTvl = tvlHistory.length > 0 ? tvlHistory[tvlHistory.length - 1].tvl : 0

  let tvlChange24h: number | null = null
  if (tvlHistory.length >= 2) {
    const last = tvlHistory[tvlHistory.length - 1]
    const prev = tvlHistory[tvlHistory.length - 2]
    if (prev.tvl > 0) tvlChange24h = ((last.tvl - prev.tvl) / prev.tvl) * 100
  }

  return {
    tvlHistory,
    chains,
    protocols,
    dexs,
    fees,
    totalTvl,
    totalDexVolume24h,
    totalFees24h,
    tvlChange24h,
    isLoading,
    error,
    tab,
    setTab,
  }
}
