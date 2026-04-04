import { DexPair, DexSearchResponse, TrendingToken } from '@/types'

const BASE = 'https://api.dexscreener.com'

export async function searchDexPairs(query: string): Promise<DexPair[]> {
  const res = await fetch(`${BASE}/latest/dex/search?q=${encodeURIComponent(query)}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  const data: DexSearchResponse = await res.json()
  return data.pairs ?? []
}

export async function fetchTrendingTokens(): Promise<TrendingToken[]> {
  const res = await fetch(`${BASE}/token-boosts/top/v1`)
  if (!res.ok) throw new Error(`Trending fetch failed: ${res.status}`)
  return res.json()
}

export async function fetchTokenPairs(chainId: string, tokenAddress: string): Promise<DexPair[]> {
  const res = await fetch(`${BASE}/token-pairs/v1/${chainId}/${tokenAddress}`)
  if (!res.ok) throw new Error(`Token pairs fetch failed: ${res.status}`)
  return res.json()
}
