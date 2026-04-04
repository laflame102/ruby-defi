import type { GlobalTvlPoint, ChainTvl, ProtocolEntry, VolumeProtocol, FeeProtocol } from '@/types'

const BASE = 'https://api.llama.fi'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json() as Promise<T>
}

export async function fetchGlobalTvlHistory(): Promise<GlobalTvlPoint[]> {
  const data = await get<{ date: number; tvl: number }[]>('/v2/historicalChainTvl')
  return data.slice(-365)
}

export async function fetchChainTvls(): Promise<ChainTvl[]> {
  const data = await get<{ name: string; tvl: number; tokenSymbol?: string }[]>('/v2/chains')
  return data
    .filter(c => c.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 15)
}

interface RawProtocol {
  id: string
  name: string
  symbol: string
  chain: string
  chains: string[]
  tvl: number
  change_1d: number | null
  change_7d: number | null
  mcap: number | null
  logo?: string
  category?: string
}

export async function fetchTopProtocols(): Promise<ProtocolEntry[]> {
  const data = await get<RawProtocol[]>('/v2/protocols')
  return data
    .filter(p => p.tvl > 0)
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 50)
}

interface RawDexProtocol {
  name: string
  displayName: string
  total24h: number | null
  total7d: number | null
  totalAllTime: number | null
  logo?: string
  chains: string[]
  category?: string
}

interface RawOverview {
  total24h: number
  protocols: RawDexProtocol[]
}

export async function fetchDexOverview(): Promise<{ total24h: number; protocols: VolumeProtocol[] }> {
  const data = await get<RawOverview>(
    '/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
  )
  return {
    total24h: data.total24h ?? 0,
    protocols: (data.protocols ?? [])
      .filter(p => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, 30),
  }
}

interface RawFeeProtocol {
  name: string
  displayName: string
  total24h: number | null
  total7d: number | null
  logo?: string
  chains: string[]
}

interface RawFeesOverview {
  total24h: number
  protocols: RawFeeProtocol[]
}

export async function fetchFeesOverview(): Promise<{ total24h: number; protocols: FeeProtocol[] }> {
  const data = await get<RawFeesOverview>(
    '/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'
  )
  return {
    total24h: data.total24h ?? 0,
    protocols: (data.protocols ?? [])
      .filter(p => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, 30),
  }
}
