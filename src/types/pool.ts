export interface LendingPool {
  id: string
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apy: number
  apyBase: number
  apyReward: number | null
  rewardTokens: string[] | null
  pool: string
  poolMeta: string | null
  underlyingTokens: string[] | null
  url: string
}

export interface DefiLlamaPoolResponse {
  status: string
  data: DefiLlamaPool[]
}

export interface DefiLlamaPool {
  chain: string
  project: string
  symbol: string
  tvlUsd: number
  apyBase: number
  apyReward: number | null
  apy: number
  rewardTokens: string[] | null
  pool: string
  poolMeta: string | null
  underlyingTokens: string[] | null
  exposure: string
  stablecoin: boolean
  ilRisk: string
}

export type PoolFilter = 'all' | 'stablecoin' | 'ethereum' | 'base' | 'arbitrum'

export interface PoolsState {
  pools: LendingPool[]
  isLoading: boolean
  error: string | null
  filter: PoolFilter
  lastUpdated: Date | null
}
