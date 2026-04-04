export interface DexPairToken {
  address: string
  name: string
  symbol: string
}

export interface DexPairTxns {
  buys: number
  sells: number
}

export interface DexPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: DexPairToken
  quoteToken: DexPairToken
  priceNative: string
  priceUsd: string
  txns: {
    m5: DexPairTxns
    h1: DexPairTxns
    h6: DexPairTxns
    h24: DexPairTxns
  }
  volume: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
  pairCreatedAt?: number
  info?: {
    imageUrl?: string
    header?: string
    websites?: { label: string; url: string }[]
    socials?: { type: string; url: string }[]
  }
  boosts?: {
    active: number
  }
}

export interface DexSearchResponse {
  schemaVersion: string
  pairs: DexPair[] | null
}

export interface TrendingToken {
  amount: number
  totalAmount: number
  icon?: string
  description?: string
  links?: { type: string; label: string; url: string }[]
  chainId: string
  tokenAddress: string
  url: string
}

export type ChainFilter =
  | 'all'
  | 'ethereum'
  | 'bsc'
  | 'base'
  | 'arbitrum'
  | 'solana'
  | 'polygon'
  | 'avalanche'

export type ScreenerSortField =
  | 'liquidity'
  | 'volume'
  | 'priceChange'
  | 'txns'
  | 'fdv'
  | 'marketCap'

export type SortDirection = 'asc' | 'desc'
