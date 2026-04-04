export interface GlobalTvlPoint {
  date: number
  tvl: number
}

export interface ChainTvl {
  name: string
  tvl: number
  tokenSymbol?: string
}

export interface ProtocolEntry {
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

export interface VolumeProtocol {
  name: string
  displayName: string
  total24h: number | null
  total7d: number | null
  totalAllTime: number | null
  logo?: string
  chains: string[]
  category?: string
}

export interface FeeProtocol {
  name: string
  displayName: string
  total24h: number | null
  total7d: number | null
  logo?: string
  chains: string[]
}

export type AnalyticsTab = 'dexs' | 'fees'
