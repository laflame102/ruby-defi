import { LendingPool, DefiLlamaPool, DefiLlamaPoolResponse } from '@/types'

const DEFI_LLAMA_YIELDS_API = 'https://yields.llama.fi/pools'

const SUPPORTED_PROJECTS = [
  'aave-v3',
  'compound-v3',
  'spark',
  'morpho-blue',
  'fluid',
  'euler',
  'venus',
]

const SUPPORTED_CHAINS = ['Ethereum', 'Base', 'Arbitrum', 'Optimism', 'Polygon']

const PROJECT_URLS: Record<string, (pool: DefiLlamaPool) => string> = {
  'aave-v3': (pool) => {
    const chainSlug = pool.chain.toLowerCase()
    return `https://app.aave.com/reserve-overview/?underlyingAsset=${pool.underlyingTokens?.[0] || ''}&marketName=proto_${chainSlug}_v3`
  },
  'compound-v3': () => 'https://app.compound.finance/markets',
  'spark': () => 'https://app.spark.fi/markets',
  'morpho-blue': () => 'https://app.morpho.org/',
  'fluid': () => 'https://fluid.instadapp.io/',
  'euler': () => 'https://app.euler.finance/',
  'venus': () => 'https://app.venus.io/core-pool',
}

const getProjectUrl = (pool: DefiLlamaPool): string => {
  const urlGenerator = PROJECT_URLS[pool.project]
  if (urlGenerator) {
    return urlGenerator(pool)
  }
  return `https://defillama.com/yields/pool/${pool.pool}`
}

const formatProjectName = (project: string): string => {
  const names: Record<string, string> = {
    'aave-v3': 'Aave V3',
    'compound-v3': 'Compound V3',
    'spark': 'Spark',
    'morpho-blue': 'Morpho Blue',
    'fluid': 'Fluid',
    'euler': 'Euler',
    'venus': 'Venus',
  }
  return names[project] || project
}

export async function fetchLendingPools(): Promise<LendingPool[]> {
  const response = await fetch(DEFI_LLAMA_YIELDS_API)

  if (!response.ok) {
    throw new Error(`Failed to fetch pools: ${response.statusText}`)
  }

  const data: DefiLlamaPoolResponse = await response.json()

  const filteredPools = data.data
    .filter((pool) =>
      SUPPORTED_PROJECTS.includes(pool.project) &&
      SUPPORTED_CHAINS.includes(pool.chain) &&
      pool.tvlUsd > 1_000_000 &&
      pool.apy >= 1 &&
      pool.apy < 100
    )
    .sort((a, b) => b.tvlUsd - a.tvlUsd)
    .slice(0, 50)

  return filteredPools.map((pool): LendingPool => ({
    id: pool.pool,
    chain: pool.chain,
    project: formatProjectName(pool.project),
    symbol: pool.symbol,
    tvlUsd: pool.tvlUsd,
    apy: pool.apy,
    apyBase: pool.apyBase,
    apyReward: pool.apyReward,
    rewardTokens: pool.rewardTokens,
    pool: pool.pool,
    poolMeta: pool.poolMeta,
    underlyingTokens: pool.underlyingTokens,
    url: getProjectUrl(pool),
  }))
}

export async function fetchPoolsByProject(project: string): Promise<LendingPool[]> {
  const pools = await fetchLendingPools()
  return pools.filter((pool) =>
    pool.project.toLowerCase().includes(project.toLowerCase())
  )
}

export async function fetchPoolsByChain(chain: string): Promise<LendingPool[]> {
  const pools = await fetchLendingPools()
  return pools.filter((pool) =>
    pool.chain.toLowerCase() === chain.toLowerCase()
  )
}
