'use client'

import { useState, useCallback } from 'react'
import { useScreener } from '@/hooks'
import { DexPair, TrendingToken, ChainFilter, ScreenerSortField } from '@/types'

const CHAIN_META: Record<string, { label: string; cls: string; dot: string }> = {
  ethereum:  { label: 'ETH',   cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400' },
  bsc:       { label: 'BSC',   cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', dot: 'bg-yellow-400' },
  base:      { label: 'BASE',  cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', dot: 'bg-indigo-400' },
  arbitrum:  { label: 'ARB',   cls: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',    dot: 'bg-cyan-400' },
  solana:    { label: 'SOL',   cls: 'bg-purple-500/10 text-purple-400 border-purple-500/20', dot: 'bg-purple-400' },
  polygon:   { label: 'POL',   cls: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  avalanche: { label: 'AVAX',  cls: 'bg-red-500/10 text-red-400 border-red-500/20',       dot: 'bg-red-400' },
  optimism:  { label: 'OP',    cls: 'bg-rose-500/10 text-rose-400 border-rose-500/20',    dot: 'bg-rose-400' },
}

const CHAIN_FILTERS: { value: ChainFilter; label: string }[] = [
  { value: 'all',       label: 'All Chains' },
  { value: 'ethereum',  label: 'Ethereum' },
  { value: 'base',      label: 'Base' },
  { value: 'arbitrum',  label: 'Arbitrum' },
  { value: 'bsc',       label: 'BSC' },
  { value: 'solana',    label: 'Solana' },
  { value: 'polygon',   label: 'Polygon' },
]

function getChainMeta(chainId: string) {
  return CHAIN_META[chainId.toLowerCase()] ?? {
    label: chainId.slice(0, 4).toUpperCase(),
    cls: 'bg-gray-700/50 text-gray-400 border-gray-600/30',
    dot: 'bg-gray-400',
  }
}

function formatPrice(price: string | undefined): string {
  if (!price) return '—'
  const n = parseFloat(price)
  if (!n || isNaN(n)) return '—'
  if (n < 0.000001) return `$${n.toExponential(2)}`
  if (n < 0.0001)   return `$${n.toFixed(7)}`
  if (n < 0.01)     return `$${n.toFixed(5)}`
  if (n < 1)        return `$${n.toFixed(4)}`
  if (n < 10000)    return `$${n.toFixed(2)}`
  return `$${formatCompact(n)}`
}

function formatCompact(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3)  return `${(n / 1e3).toFixed(1)}K`
  return n.toFixed(2)
}

function formatUsd(n: number | undefined): string {
  if (!n || isNaN(n)) return '—'
  return `$${formatCompact(n)}`
}

function formatChange(n: number | undefined): { text: string; positive: boolean | null } {
  if (n === undefined || n === null || isNaN(n)) return { text: '—', positive: null }
  const sign = n >= 0 ? '+' : ''
  return { text: `${sign}${n.toFixed(2)}%`, positive: n >= 0 }
}

function formatAge(ts: number | undefined): string {
  if (!ts) return '—'
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 60)         return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)         return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30)         return `${d}d`
  const mo = Math.floor(d / 30)
  return `${mo}mo`
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function ChangeCell({ value }: { value: number | undefined }) {
  const { text, positive } = formatChange(value)
  if (positive === null) return <span className="text-gray-600 font-mono text-xs">—</span>
  return (
    <span className={`font-mono text-xs font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
      {text}
    </span>
  )
}

function TokenLogo({ src, symbol, size = 32 }: { src?: string; symbol: string; size?: number }) {
  const [failed, setFailed] = useState(false)
  const colors = ['bg-green-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500', 'bg-rose-500', 'bg-cyan-500']
  const color = colors[symbol.charCodeAt(0) % colors.length]
  const dim = `w-${size === 32 ? 8 : 10} h-${size === 32 ? 8 : 10}`

  if (!src || failed) {
    return (
      <div className={`${dim} rounded-full ${color} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
        {symbol.charAt(0)}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={symbol}
      className={`${dim} rounded-full object-cover shrink-0 bg-gray-800`}
      onError={() => setFailed(true)}
    />
  )
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = 'right',
}: {
  label: string
  field: ScreenerSortField
  currentField: ScreenerSortField
  direction: 'asc' | 'desc'
  onSort: (f: ScreenerSortField) => void
  align?: 'left' | 'right'
}) {
  const active = currentField === field
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap ${
        active ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'
      } ${align === 'right' ? 'ml-auto' : ''}`}
    >
      {label}
      <span className="text-[10px]">
        {active ? (direction === 'desc' ? '↓' : '↑') : '↕'}
      </span>
    </button>
  )
}

function TxnsBar({ buys, sells }: { buys: number; sells: number }) {
  const total = buys + sells
  if (!total) return <span className="text-gray-600 text-xs font-mono">—</span>
  const buyPct = (buys / total) * 100
  return (
    <div className="flex flex-col gap-0.5 items-end">
      <div className="flex items-center gap-1.5">
        <span className="text-green-400 text-xs font-mono">{buys}</span>
        <span className="text-gray-600 text-xs">/</span>
        <span className="text-red-400 text-xs font-mono">{sells}</span>
      </div>
      <div className="w-16 h-1 rounded-full bg-red-500/30 overflow-hidden">
        <div
          className="h-full bg-green-500/70 rounded-full transition-all"
          style={{ width: `${buyPct}%` }}
        />
      </div>
    </div>
  )
}

function PairRow({
  pair,
  rank,
  selected,
  onClick,
  compact,
}: {
  pair: DexPair
  rank: number
  selected: boolean
  onClick: () => void
  compact: boolean
}) {
  const chain = getChainMeta(pair.chainId)
  const change24h = formatChange(pair.priceChange?.h24)

  return (
    <tr
      onClick={onClick}
      className={`border-b border-gray-800/60 cursor-pointer transition-all group ${
        selected
          ? 'bg-green-500/8 border-l-2 border-l-green-500'
          : 'hover:bg-gray-800/40 border-l-2 border-l-transparent'
      }`}
    >
      <td className="pl-4 pr-2 py-3 text-gray-600 text-xs font-mono w-8">{rank}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <TokenLogo src={pair.info?.imageUrl} symbol={pair.baseToken.symbol} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm truncate">
                {pair.baseToken.symbol}
              </span>
              <span className="text-gray-600 text-xs">/{pair.quoteToken.symbol}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${chain.cls}`}>
                {chain.label}
              </span>
              <span className="text-gray-600 text-[10px] truncate capitalize">{pair.dexId}</span>
              {pair.boosts?.active ? (
                <span className="text-orange-400 text-[10px] font-semibold">HOT</span>
              ) : null}
            </div>
          </div>
        </div>
      </td>
      {!compact && (
        <td className="px-3 py-3 text-right">
          <span className="text-white font-mono text-sm">{formatPrice(pair.priceUsd)}</span>
        </td>
      )}
      {!compact && (
        <>
          <td className="px-2 py-3 text-right"><ChangeCell value={pair.priceChange?.m5} /></td>
          <td className="px-2 py-3 text-right"><ChangeCell value={pair.priceChange?.h1} /></td>
          <td className="px-2 py-3 text-right"><ChangeCell value={pair.priceChange?.h6} /></td>
        </>
      )}
      <td className="px-2 py-3 text-right">
        <ChangeCell value={pair.priceChange?.h24} />
      </td>
      {!compact && (
        <>
          <td className="px-3 py-3 text-right">
            <span className="text-gray-300 font-mono text-xs">{formatUsd(pair.volume?.h24)}</span>
          </td>
          <td className="px-3 py-3 text-right">
            <span className="text-gray-300 font-mono text-xs">{formatUsd(pair.liquidity?.usd)}</span>
          </td>
          <td className="px-3 py-3 text-right">
            <span className="text-gray-400 font-mono text-xs">{formatUsd(pair.fdv)}</span>
          </td>
          <td className="px-3 py-3">
            <TxnsBar buys={pair.txns?.h24?.buys ?? 0} sells={pair.txns?.h24?.sells ?? 0} />
          </td>
          <td className="px-3 py-3 text-right">
            <span className="text-gray-500 font-mono text-xs">{formatAge(pair.pairCreatedAt)}</span>
          </td>
        </>
      )}
    </tr>
  )
}

function PairDetailPanel({
  pair,
  onClose,
}: {
  pair: DexPair
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const chain = getChainMeta(pair.chainId)
  const change24h = formatChange(pair.priceChange?.h24)
  const buys = pair.txns?.h24?.buys ?? 0
  const sells = pair.txns?.h24?.sells ?? 0
  const total = buys + sells
  const buyPct = total ? (buys / total) * 100 : 50

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(pair.pairAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [pair.pairAddress])

  const chartUrl = `https://dexscreener.com/${pair.chainId}/${pair.pairAddress}?embed=1&theme=dark&trades=0&info=0`

  return (
    <div className="flex flex-col h-full">
      {/* Header: token identity + price + close */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <TokenLogo src={pair.info?.imageUrl} symbol={pair.baseToken.symbol} size={40} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-base">{pair.baseToken.symbol}</span>
              <span className="text-gray-500 text-sm">/{pair.quoteToken.symbol}</span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${chain.cls}`}>
                {chain.label}
              </span>
            </div>
            <span className="text-gray-500 text-xs capitalize">{pair.dexId}</span>
          </div>
          <div className="ml-3 pl-3 border-l border-gray-800">
            <div className="flex items-baseline gap-2">
              <span className="text-white font-mono font-bold text-xl">{formatPrice(pair.priceUsd)}</span>
              <span className={`font-mono font-semibold text-sm ${change24h.positive ? 'text-green-400' : change24h.positive === false ? 'text-red-400' : 'text-gray-500'}`}>
                {change24h.text}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Stats strip: period changes + key metrics + txns — horizontal, no-scroll */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-800 shrink-0 overflow-x-auto bg-gray-900/40">
        {(['m5', 'h1', 'h6', 'h24'] as const).map(period => {
          const chg = formatChange(pair.priceChange?.[period])
          return (
            <div key={period} className="flex flex-col items-center bg-gray-800/60 rounded-lg px-2.5 py-1 shrink-0">
              <span className="text-gray-600 text-[9px] uppercase font-medium">{period}</span>
              <span className={`font-mono text-xs font-semibold ${chg.positive ? 'text-green-400' : chg.positive === false ? 'text-red-400' : 'text-gray-500'}`}>
                {chg.text}
              </span>
            </div>
          )
        })}

        <div className="w-px h-6 bg-gray-800 mx-1 shrink-0" />

        {[
          { label: 'Vol 24h', value: formatUsd(pair.volume?.h24) },
          { label: 'Liquidity', value: formatUsd(pair.liquidity?.usd) },
          { label: 'FDV', value: formatUsd(pair.fdv) },
          { label: 'MCap', value: formatUsd(pair.marketCap) },
        ].map(stat => (
          <div key={stat.label} className="flex flex-col items-center bg-gray-800/40 rounded-lg px-2.5 py-1 shrink-0">
            <span className="text-gray-600 text-[9px] uppercase font-medium">{stat.label}</span>
            <span className="text-white font-mono text-xs font-semibold">{stat.value}</span>
          </div>
        ))}

        {total > 0 && (
          <>
            <div className="w-px h-6 bg-gray-800 mx-1 shrink-0" />
            <div className="flex flex-col gap-0.5 shrink-0 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 text-[9px] uppercase font-medium">Txns 24h</span>
                <span className="text-gray-500 text-[9px] font-mono">{total.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-green-400 text-[10px] font-mono font-semibold">{buys} B</span>
                <div className="w-20 h-1.5 rounded-full bg-red-500/30 overflow-hidden">
                  <div className="h-full bg-green-500/70 rounded-full" style={{ width: `${buyPct}%` }} />
                </div>
                <span className="text-red-400 text-[10px] font-mono font-semibold">{sells} S</span>
              </div>
            </div>
          </>
        )}

        <div className="ml-auto shrink-0 flex items-center gap-2">
          {pair.info?.websites?.map(w => (
            <a
              key={w.url}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-500 hover:text-green-400 transition-colors whitespace-nowrap"
            >
              {w.label || 'Website'} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Chart — fills all remaining space */}
      <div className="flex-1 min-h-0">
        <iframe
          src={chartUrl}
          className="w-full h-full border-0"
          allow="clipboard-write"
          title={`${pair.baseToken.symbol}/${pair.quoteToken.symbol} chart`}
        />
      </div>

      {/* Footer: contract + dexscreener link */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-gray-800 shrink-0 bg-gray-900/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-gray-600 text-xs shrink-0">Contract</span>
          <span className="text-gray-400 font-mono text-xs truncate">{pair.pairAddress}</span>
          <button
            onClick={copyAddress}
            className="text-gray-500 hover:text-green-400 transition-colors shrink-0 text-xs font-medium"
          >
            {copied ? '✓' : 'copy'}
          </button>
        </div>
        <a
          href={pair.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white text-xs font-medium transition-colors shrink-0"
        >
          DexScreener ↗
        </a>
      </div>
    </div>
  )
}

function TrendingChip({
  token,
  onClick,
}: {
  token: TrendingToken
  onClick: (t: TrendingToken) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const chain = getChainMeta(token.chainId)

  return (
    <button
      onClick={() => onClick(token)}
      className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700/50 hover:border-green-500/30 rounded-full transition-all whitespace-nowrap shrink-0 group"
    >
      {token.icon && !imgFailed ? (
        <img
          src={token.icon}
          alt=""
          className="w-4 h-4 rounded-full shrink-0"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={`w-2 h-2 rounded-full shrink-0 ${chain.dot}`} />
      )}
      <span className="text-gray-300 group-hover:text-white text-xs font-medium transition-colors">
        {shortenAddress(token.tokenAddress)}
      </span>
      <span className={`text-[10px] font-medium ${chain.cls.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
        {chain.label}
      </span>
    </button>
  )
}

export function ScreenerPage() {
  const {
    pairs,
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
    selectPair,
    loadTrendingToken,
  } = useScreener()

  const compact = !!selectedPair

  const handleRowClick = useCallback(
    (pair: DexPair) => {
      selectPair(selectedPair?.pairAddress === pair.pairAddress ? null : pair)
    },
    [selectPair, selectedPair]
  )

  return (
    <div className={compact ? 'flex flex-col h-[calc(100vh-65px)] overflow-hidden' : 'max-w-[1600px] mx-auto px-4 py-6 flex flex-col gap-5'}>

      {/* ── Compact top bar (detail mode) ── */}
      {compact && (
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-800 shrink-0 bg-gray-950/80 backdrop-blur-sm">
          <span className="text-white font-bold text-sm shrink-0">DEX Screener</span>
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-3 py-1.5 text-white placeholder-gray-600 text-xs outline-none focus:border-green-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {CHAIN_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setChainFilter(f.value)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  chainFilter === f.value
                    ? 'bg-green-500/15 text-green-400 border-green-500/40'
                    : 'bg-gray-800/50 text-gray-500 border-gray-700/50 hover:text-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <span className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {pairs.length} pairs
            </span>
          </div>
        </div>
      )}

      {/* ── Full top section (browse mode) ── */}
      {!compact && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">DEX Screener</h1>
              <p className="text-gray-500 text-sm mt-0.5">Live token pairs across all chains · Powered by DexScreener</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
              <span className="text-xs text-gray-600 bg-gray-800/60 border border-gray-700/50 px-3 py-1.5 rounded-full font-mono">
                {pairs.length} pairs
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search token name, symbol or contract address…"
              className="w-full bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl pl-10 pr-10 py-3.5 text-white placeholder-gray-600 text-sm outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!isLoadingTrending && trending.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-gray-600 text-xs uppercase tracking-wider font-medium">Trending</span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {trending.map(token => (
                  <TrendingChip key={`${token.chainId}-${token.tokenAddress}`} token={token} onClick={loadTrendingToken} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CHAIN_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setChainFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  chainFilter === f.value
                    ? 'bg-green-500/15 text-green-400 border-green-500/40'
                    : 'bg-gray-800/50 text-gray-500 border-gray-700/50 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Main content area ── */}
      <div className={`flex gap-3 ${compact ? 'flex-1 min-h-0 px-3 pb-3' : ''}`}>

        {/* Token list */}
        <div className={`${compact ? 'w-[230px] shrink-0 flex flex-col' : 'w-full'} bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden`}>
          <div className={`overflow-x-auto ${compact ? 'overflow-y-auto flex-1' : ''}`}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pl-4 pr-2 py-3 text-left w-8">
                    <span className="text-gray-600 text-xs">#</span>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Token</span>
                  </th>
                  {!compact && (
                    <>
                      <th className="px-3 py-3 text-right">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Price</span>
                      </th>
                      <th className="px-2 py-3">
                        <SortHeader label="5M" field="priceChange" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-2 py-3">
                        <SortHeader label="1H" field="priceChange" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-2 py-3">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider ml-auto block text-right">6H</span>
                      </th>
                    </>
                  )}
                  <th className="px-2 py-3">
                    <SortHeader label="24H" field="priceChange" currentField={sortField} direction={sortDirection} onSort={setSort} />
                  </th>
                  {!compact && (
                    <>
                      <th className="px-3 py-3">
                        <SortHeader label="Volume" field="volume" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-3 py-3">
                        <SortHeader label="Liquidity" field="liquidity" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-3 py-3">
                        <SortHeader label="FDV" field="fdv" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-3 py-3">
                        <SortHeader label="Txns 24H" field="txns" currentField={sortField} direction={sortDirection} onSort={setSort} />
                      </th>
                      <th className="px-3 py-3 text-right">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Age</span>
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-800/50">
                      <td className="pl-4 pr-2 py-3">
                        <div className="w-4 h-3 bg-gray-800 rounded animate-pulse" />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-800 animate-pulse" />
                          <div className="space-y-1.5">
                            <div className="w-20 h-3 bg-gray-800 rounded animate-pulse" />
                            <div className="w-14 h-2.5 bg-gray-800/70 rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      {Array.from({ length: compact ? 1 : 9 }).map((_, j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="w-16 h-3 bg-gray-800/70 rounded animate-pulse ml-auto" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!isLoading && error && (
                  <tr>
                    <td colSpan={compact ? 3 : 12} className="py-16 text-center">
                      <p className="text-red-400 text-sm">{error}</p>
                    </td>
                  </tr>
                )}

                {!isLoading && !error && pairs.length === 0 && (
                  <tr>
                    <td colSpan={compact ? 3 : 12} className="py-16 text-center">
                      <p className="text-gray-500 text-sm">No pairs found</p>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  pairs.map((pair, i) => (
                    <PairRow
                      key={`${pair.chainId}-${pair.pairAddress}`}
                      pair={pair}
                      rank={i + 1}
                      selected={selectedPair?.pairAddress === pair.pairAddress}
                      onClick={() => handleRowClick(pair)}
                      compact={compact}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel — takes all remaining space */}
        {selectedPair && (
          <div className="flex-1 min-w-0 min-h-0 bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
            <PairDetailPanel pair={selectedPair} onClose={() => selectPair(null)} />
          </div>
        )}
      </div>
    </div>
  )
}
